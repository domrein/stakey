"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  app.get("/assign/:callingId", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({callingId: "int"}, req.params);
      Object.assign(data, await tean.normalize({action: "string(interview,sustain,setApart)!null"}, req.query));
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    // look up calling data
    let calling = null;
    try {
      calling = await db.query(`
        SELECT c.firstName, c.lastName, c.position
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
    if (!calling.length) {
      next();
      return;
    }

    calling = calling[0];

    res.render("assign.pug", {
      action: config.stake.name,
      candidate: `${calling.firstName} ${calling.lastName}`,
      position: calling.position,
    });
  });
};
