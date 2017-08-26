"use strict";

const config = require("../../config.json");

const tean = require("tean");

const approval = require("../controllers/approval.js");
const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const email = require("../controllers/email.js");
const assign = require("../controllers/assign.js");
const calling = require("../controllers/calling.js");
const code = require("../utils/code.js");

exports.add = app => {
  // create a new calling
  app.get("/calling", security.authorize(security.USER), (req, res) => {
    res.render("calling.pug", {
      // TEST DATA
      // firstName: "Paul",
      // middleName: "Timothy",
      // lastName: "Milham",
      // position: "Stake Cookie Tester",
      // reason: "Because he is the best cookie taster in town.",
      // templeWorthy: true,
      // ward: "mb2",
      // currentCalling: "Stake Technology Specialist",
      // phoneNumber: "801-830-7917",
      // bishopConsulted: true,
      // councilRepConsulted: false,

      stake: config.stake.name,
      username: security.getUsername(req),
      wards: config.stake.wards,
      canSkipStakeApproval: security.canSkipStakeApproval(req),
    });
  });

  // view a specific calling
  app.get("/calling/:id", security.authorize(security.USER), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({id: "int"}, req.params);
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    // look up all info for calling and put into read only mode
    let rows = null;
    try {
      rows = await db.query(`
        SELECT
          id,
          firstName,
          middleName,
          lastName,
          position,
          reason,
          templeWorthy,
          ward,
          currentCalling,
          phoneNumber,
          bishopConsulted,
          councilRepConsulted,
          state
        FROM callings WHERE id = ? LIMIT 1
      `, [data.id]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // show 404 if no rows found
    if (!rows.length) {
      next();
    }
    else {
      const calling = rows[0];
      res.render("calling.pug", {
        username: security.getUsername(req),
        id: calling.id,
        viewMode: true,
        canDelete: security.canDeleteCalling(req),
        firstName: calling.firstName,
        middleName: calling.middleName,
        lastName: calling.lastName,
        position: calling.position,
        reason: calling.reason,
        templeWorthy: calling.templeWorthy === 1 ? true : calling.templeWorthy === false ? 0 : null,
        ward: calling.ward,
        currentCalling: calling.currentCalling,
        phoneNumber: calling.phoneNumber,
        bishopConsulted: !!calling.bishopConsulted,
        councilRepConsulted: !!calling.councilRepConsulted,
        stake: config.stake.name,
        wards: config.stake.wards,
        canSkipStakeApproval: security.canSkipStakeApproval(req),
        canRegressCallingState: security.canUpdateCallingState(req) && calling.state,
      });
    }
  });

  // create a new calling
  app.post("/calling", security.authorize(security.USER), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({
        firstName: "string(45)",
        middleName: "string(45)",
        lastName: "string(45)",
        position: "string(45)",
        reason: "string(2048)",
        templeWorthy: "bool!null",
        ward: `string(${config.stake.wards.map(w => w.id).join(",")})`,
        currentCalling: "string(45)",
        phoneNumber: "string(45)",
        bishopConsulted: "bool",
        councilRepConsulted: "bool",
      }, req.body);
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    // massage data for database
    if (data.templeWorthy === false) {
      data.templeWorthy = 0;
    }
    else if (data.templeWorthy === true) {
      data.templeWorthy = 1;
    }
    data.bishopConsulted = data.bishopConsulted ? 1 : 0;
    data.councilRepConsulted = data.councilRepConsulted ? 1 : 0;

    let result = null;
    try {
      result = await db.query(`
        INSERT INTO callings (
          firstName,
          middleName,
          lastName,
          position,
          reason,
          templeWorthy,
          ward,
          currentCalling,
          phoneNumber,
          bishopConsulted,
          councilRepConsulted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        data.firstName,
        data.middleName,
        data.lastName,
        data.position,
        data.reason,
        data.templeWorthy,
        data.ward,
        data.currentCalling,
        data.phoneNumber,
        data.bishopConsulted,
        data.councilRepConsulted,
      ]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // send reply
    const callingId = result.insertId;
    try {
      await approval.generateApprovals(callingId);
    }
    catch (err) {
      console.error(err);
      console.error(`Unable to send emails for new calling ${callingId}`);
      res.status(500).send();
      return;
    }

    res.status(200).send();
  });

  // delete a calling
  app.delete("/calling/:id", security.authorize(security.STAKE_PRESIDENCY), async (req, res) => {
    // TODO: only admins should be able to delete a calling
    let data = null;
    try {
      data = await tean.normalize({id: "int"}, req.params);
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    try {
      await db.query(`
        UPDATE callings SET deleted = 1 WHERE id = ? LIMIT 1
      `, [data.id]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
    }

    res.status(200).send();
  });

  // advance or regress a calling's state
  app.post("/calling/:id/updateState", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({id: "int"}, req.params);
      Object.assign(data, await tean.normalize({advance: "bool!null"}, req.query));
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    // get calling state
    let callingState = null;
    try {
      const rows = await db.query(`
        SELECT state
        FROM callings WHERE id = ? LIMIT 1
      `, [data.id]);
      if (!rows.length) {
        throw new Error("Invalid calling");
      }
      callingState = rows[0].state;
    }
    catch (err) {
      console.error(err);
      res.status(400).send(`Unable to find calling with id ${data.id}`);
      return;
    }

    // bail out if invalid transformation
    if (callingState <= calling.minStateId && !data.advance) {
      res.status(400).send(`Unable to regress calling past ${calling.stateIdToName(callingState)}`);
    }
    // use assign to move past high council (until complete)
    else if (callingState >= calling.states.highCouncil && callingState < calling.states.mls && data.advance) {
      res.status(400).send(`Unable to advance calling past ${calling.stateIdToName(callingState)} unless completing`);
    }

    // increment calling state
    try {
      await calling.updateState(data.id, data.advance);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // if regressing, invalidate current calling approvals
    if (callingState === calling.states.highCouncil && !data.advance) {
      try {
        await db.query(`
          UPDATE approvals
          SET deleted = 1
          WHERE callingId = ? AND state = ?
        `, [data.id, callingState]);
      }
      catch (err) {
        console.error(err);
        res.status(500).send();
        return;
      }
    }
    // otherwise delete assignment
    else if (data.advance) {
      try {
        await db.query(`
          UPDATE assignments
          SET deleted = 1
          WHERE callingId = ? AND callingState = ?
        `, [data.id, callingState]);
      }
      catch (err) {
        console.error(err);
        res.status(500).send();
        return;
      }
    }

    // if advancing from stake presidency to high council, generate approvals
    if (callingState === calling.states.stakePresidency && data.advance) {
      try {
        await approval.generateApprovals(data.id);
      }
      catch (err) {
        console.error(err);
        res.status(500).send();
        return;
      }
    }

    res.status(200).send();
  });

  app.post("/calling/:id/assign", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({id: "int"}, req.params);
      Object.assign(data, await tean.normalize({
        action: "string(interview,sustain,setApart,mls)",
        assignee: "int",
      }, req.body));
    }
    catch (err) {
      console.warn(err);
      res.status(400).send("Invalid parameters");
      return;
    }

    // get user info
    let assigneeEmail = null;
    try {
      const rows = await db.query(`
        SELECT email
        FROM users WHERE id = ? LIMIT 1
      `, [data.assignee]);
      if (!rows.length) {
        throw new Error("Invalid user");
      }
      assigneeEmail = rows[0].email;
    }
    catch (err) {
      console.error(err);
      res.status(400).send(`Unable to find user with id ${data.assignee}`);
      return;
    }

    // get calling info
    let rows = null;
    try {
      rows = await db.query(`
        SELECT
          id,
          state,
          firstName,
          lastName,
          position,
          phoneNumber
        FROM callings WHERE id = ? LIMIT 1
      `, [data.id]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }
    if (!rows.length) {
      console.error(`Unable to find calling with id ${data.id}`);
      res.status(500).send();
      return;
    }
    const row = rows[0];

    const linkCode = code.generate(16);

    try {
      await calling.updateState(row.id, true);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // send assignment email
    // this should be a single use link that only advanced from the current state to the next (so if the state is manually advanced, the link should do nothing)
    // this also needs to be reachable from someone not logged in
    const candidate = `${row.firstName} ${row.lastName}`;
    const link = `${config.host}/assignment/${linkCode}`;
    try {
      email.send(
        assigneeEmail,
        `assignments@${config.hostname}`,
        `New ${assign.actionIdToNoun(data.action)} Assignment`,
        `You have been assigned to conduct the ${assign.actionIdToNoun(data.action).toLowerCase()} for ${candidate} for ${row.position}. ${candidate} can be contacted at ${row.phoneNumber}. Please follow this link when you have completed the assignment. ${link}`,
        `
          <p>You have been assigned to conduct the ${assign.actionIdToNoun(data.action).toLowerCase()} for ${candidate} for ${row.position}.</p>
          <p>${candidate} can be contacted at ${row.phoneNumber}.</p>
          <p>Please follow this link when you have completed the assignment.</p>
          <a href="${link}">${link}</a>
        `
      );
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // create assignment
    try {
      await db.query(`
        INSERT INTO assignments (userId, linkCode, callingId, callingState)
        VALUES (?, ?, ?, ?)
      `, [data.assignee, linkCode, row.id, row.state + 1]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    res.status(200).send();
  });
};
