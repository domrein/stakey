"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const email = require("../controllers/email.js");

exports.add = app => {
  app.get("/approval/:linkCode", security.authorize(security.UNAUTHORIZED), async (req, res, next) => {
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

    // look up current approval state
    let approval = null;
    try {
      approval = await db.query(`
        SELECT a.callingId, c.firstName, c.middleName, c.lastName, c.position, a.approved, a.id, c.state, a.deleted
        FROM approvals a
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
    if (!approval.length) {
      next();
      return;
    }

    approval = approval[0];

    if (data.approved !== null && approval.approved === null) {
      try {
        console.log([data.approved ? 1 : 0, approval.id]);
        await db.query("UPDATE approvals SET approved = ? WHERE id = ? LIMIT 1", [data.approved ? 1 : 0, approval.id]);
      }
      catch (err) {
        console.error(err);
        res.status(500).send();
        return;
      }

      // only notify if approval has not been deleted
      if (!approval.deleted) {
        // Callings are manually moved through tiers by stake presidency
        //  Email secretary if calling is ready to be moved to next state
        try {
          // TODO: skip this if calling has manually been advanced to a new state
          //   we don't want to notify secretary if it's irrelevant
          const result = await db.query(`
            SELECT COUNT(*) AS total FROM approvals WHERE callingId = ? AND approved IS NULL
          `, [approval.callingId]);
          if (!result[0].total) {
            await email.notifySecretary(`${approval.firstName} ${approval.lastName}`, approval.position, approval.state, approval.callingId);
          }
        }
        catch (err) {
          console.error(`Error attempting to notify secretaries for approval completion ${err}`);
        }
      }
    }


    res.render("approval.pug", {
      stake: config.stake.name,
      username: security.getUsername(req),
      approved: approval.approved,
      newApproved: data.approved === null ? data.approved : data.approved === true ? 1 : 0,
      candidate: `${approval.firstName} ${approval.middleName} ${approval.lastName}`,
      position: approval.position,
    });
  });
};
