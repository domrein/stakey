"use strict";

const tean = require("tean");

const approval = require("../controllers/approval.js");
const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  // create a new calling
  app.get("/calling", security.authorize(security.STAKE_PRESIDENCY), (req, res) => {
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
    });
  });

  // view a specific calling
  app.get("/calling/:id", security.authorize(security.HIGH_COUNCIL), async (req, res, next) => {
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
        councilRepConsulted
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
      });
    }
  });

  // create a new calling
  app.post("/calling", security.authorize(security.STAKE_PRESIDENCY), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({
        firstName: "string(45)",
        middleName: "string(45)",
        lastName: "string(45)",
        position: "string(45)",
        reason: "string(255)",
        templeWorthy: "bool!null",
        ward: "string(mb2,mb3,t3,t8,t13,t14,t15)",
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
        DELETE FROM callings WHERE id = ?
      `, [data.id]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
    }

    res.status(200).send();
  });
};
