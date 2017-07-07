"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const calling = require("../controllers/calling.js");

exports.add = app => {
  app.get("/assignment/:linkCode", security.authorize(security.UNAUTHORIZED), async (req, res, next) => {
    // approved, newApproved, candidate, calling
    let data = null;
    try {
      data = await tean.normalize({linkCode: "string(16)"}, req.params);
      Object.assign(data, await tean.normalize({approved: "bool!null"}, req.query));
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    // look up current assignment state
    let assignment = null;
    try {
      assignment = await db.query(`
        SELECT a.callingId, c.firstName, c.lastName, c.position, c.state, a.approved, a.id, a.callingState, a .completed
        FROM assignments a
        INNER JOIN callings c ON a.callingId = c.id
        WHERE a.linkCode = ?
        LIMIT 1
      `, [data.linkCode]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // 404 if no record
    if (!assignment.length) {
      next();
      return;
    }

    assignment = assignment[0];

    if (!assignment.completed) {
      try {
        console.log(`Assignment id ${assignment.id} completed`);
        await db.query("UPDATE assignments SET completed = 1 WHERE id = ? LIMIT 1", [assignment.id]);
      }
      catch (err) {
        console.error(err);
        res.status(500).send();
        return;
      }
    }

    // TODO: Email secretary that assignment has been completed
    
    // only advance calling if it's still in the same state as when the assignment was made
    // BUG: we can't advance the calling automatically because then the secretary has no chance to assign for the next phase
    // if (assignment.callingState === assignment.state) {
    //   try {
    //     await calling.advanceState(assignment.callingId);
    //   }
    //   catch (err) {
    //     console.error(err);
    //     res.status(500).send();
    //     return;      
    //   }
    // }

    res.render("assignment.pug", {
      stake: config.stake.name,
      username: security.getUsername(req),
      action: calling.stateIdToAssignment(assignment.callingState),
      newCompleted: !!assignment.completed,
      candidate: `${assignment.firstName} ${assignment.lastName}`,
      position: assignment.position,
    });
  });
};
