"use strict";

const tean = require("tean");

exports.add = (app, stakeyDb) => {
  // view all callings
  app.get("/callings", (req, res) => {
    // TODO: require auth
    // pull all the stuff from the database
    stakeyDb.query(`
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
    `, [], (err, rows) => {
      if (err) {
        res.status(500).send();
      }
      else {
        // display in table
        res.render("callings.pug", {
          pendingCallings: rows.filter(r => r.state === 0),
          readyCallings: rows.filter(r => r.state === 1),
        });
      }
    });
  });
}
