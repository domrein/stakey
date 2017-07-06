"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  // view all callings
  app.get("/callings", security.authorize(security.USER), async (req, res) => {
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
            WHERE a.callingId = c.id AND a.approved = 1 AND a.state = c.state
        	) AS approvalCount,
          (
      		  SELECT COUNT(id)
            FROM approvals a
            WHERE a.callingId = c.id AND a.approved = 0 AND a.state = c.state
        	) AS denialCount,
          (
      		  SELECT COUNT(id)
            FROM approvals a
            WHERE a.callingId = c.id AND a.approved IS NULL AND a.state = c.state
        	) AS pendingCount
        FROM callings c
        WHERE c.state < 5 AND deleted = 0
      `, []);
    }
    catch (err) {
      console.error(err);
      res.status(500).send();
      return;
    }

    // display in table
    res.render("callings.pug", {
      stake: config.stake.name,
      username: security.getUsername(req),
      canCreate: security.canCreateCalling(req),
      canUpdateState: security.canUpdateCallingState(req),
      tables: [{
        name: "Pending Presidency Approval",
        callings: rows.filter(r => r.state === 0),
        showCounts: true,
      }, {
        name: "Pending High Council Approval",
        callings: rows.filter(r => r.state === 1),
        showCounts: true,
      }, {
        name: "To Be Interviewed",
        callings: rows.filter(r => r.state === 2),
        showCounts: false,
      }, {
        name: "To Be Sustained",
        callings: rows.filter(r => r.state === 3),
        showCounts: false,
      }, {
        name: "To Be Set Apart",
        callings: rows.filter(r => r.state === 4),
        showCounts: false,
      }],
    });
  });
}
