"use strict";

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

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
          c.position
        FROM callings c
        WHERE c.state = 5
        ORDER BY id DESC
        LIMIT 100
      `, []);
    }
    catch (err) {
      res.status(500).send();
      return;
    }

    // display in table
    res.render("history.pug", {
      username: security.getUsername(req),
      callings: rows,
    });
  });
}
