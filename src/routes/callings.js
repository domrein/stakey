"use strict";

const tean = require("tean");

const db = require("../controllers/database.js");

exports.add = app => {
  // view all callings
  app.get("/callings", async (req, res) => {
    // TODO: require auth
    let rows = null;
    try {
      // pull all the stuff from the database
      rows = await db.query(`
        SELECT
        	c.id,
          c.firstName,
          c.lastName,
          c.position,
          c.state,
          (
    		    SELECT COUNT(id)
            FROM approvals a
            WHERE a.callingId = c.id AND a.approved = 1
        	) AS approvalCount,
          (
      		  SELECT COUNT(id)
            FROM approvals a
            WHERE a.callingId = c.id AND a.approved = 0
        	) AS denialCount
        FROM callings c
        WHERE c.state != 2
      `, []);
    }
    catch (err) {
      res.status(500).send();
      return;
    }

    // display in table
    res.render("callings.pug", {
      pendingCallings: rows.filter(r => r.state === 0),
      readyCallings: rows.filter(r => r.state === 1),
    });
  });
}
