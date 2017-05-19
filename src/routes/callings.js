"use strict";

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  // view all callings
  app.get("/callings", security.authorize(security.HIGH_COUNCIL), async (req, res) => {
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
      username: security.getUsername(req),
      canCreate: security.canCreateCalling(req),
      tables: [{
        name: "Pending Presidency Approval",
        callings: rows.filter(r => r.state === 0),
      }, {
        name: "Pending High Council Approval",
        callings: rows.filter(r => r.state === 1),
      }, {
        name: "To Be Interviewed",
        callings: rows.filter(r => r.state === 2),
      }, {
        name: "To Be Sustained",
        callings: rows.filter(r => r.state === 3),
      }, {
        name: "To Be Set Apart",
        callings: rows.filter(r => r.state === 4),
      }],
    });
  });
}
