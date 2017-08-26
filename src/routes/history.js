"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const calling = require("../controllers/calling.js");

exports.add = app => {
  // view all callings
  app.get("/history", security.authorize(security.USER), async (req, res) => {
    let rows = null;
    try {
      // pull all the stuff from the database
      rows = await db.query(`
        SELECT
          c.firstName,
          c.lastName,
          c.position,
          c.state,
          c.deleted
        FROM callings c
        WHERE c.state = ? OR c.deleted = 1
        ORDER BY id DESC
        LIMIT 100
      `, [calling.states.complete]);
    }
    catch (err) {
      res.status(500).send();
      return;
    }

    // display in table
    res.render("history.pug", {
      stake: config.stake.name,
      username: security.getUsername(req),
      callings: rows.map(r => ({
        name: `${r.firstName} ${r.lastName}`,
        position: r.position,
        state: calling.stateIdToName(r.state),
        deleted: r.deleted ? "Yes" : "No",
      })),
    });
  });
}
