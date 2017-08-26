"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const calling = require("../controllers/calling.js");

exports.add = app => {
  app.get("/assign/:callingId", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({callingId: "int"}, req.params);
      Object.assign(data, await tean.normalize({action: "string(interview,sustain,setApart,mls)!null"}, req.query));
    }
    catch (err) {
      console.warn(err);
      res.status(400).send("Invalid parameters");
      return;
    }

    // look up calling data
    let row = null;
    try {
      row = await db.query(`
        SELECT c.id, c.firstName, c.lastName, c.position, c.state
        FROM callings c
        WHERE c.id = ?
        LIMIT 1
      `, [data.callingId]);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // 404 if no record
    if (!row.length) {
      next();
      return;
    }

    row = row[0];

    let assignees = [];
    try {
      const rows = await db.query(`
        SELECT id, CONCAT(firstName, ' ', lastName) AS name
        from users
      `, []);
      assignees = rows;
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    res.render("assign.pug", {
      stake: config.stake.name,
      username: security.getUsername(req),
      callingId: row.id,
      action: calling.stateIdToAction(row.state + 1),
      assignment: calling.stateIdToAssignment(row.state + 1),
      candidate: `${row.firstName} ${row.lastName}`,
      position: row.position,
      assignees,
    });
  });
};
