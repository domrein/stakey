"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

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
        SELECT a.callingId, c.firstName, c.middleName, c.lastName, c.position, a.approved, a.id
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
    }

    // Callings are manually moved through tiers by stake presidency
    // // move calling into ready for approval if all council members have approved/denied
    // try {
    //   const result = db.query(`
    //     SELECT COUNT(*) AS total FROM approvals WHERE callingId = ? AND approved IS NULL
    //   `, [approval.callingId]);
    //   if (!result.total) {
    //     await db.query("UPDATE callings SET state = 1 WHERE id = ?", [approval.callingId]);
    //   }
    // }
    // catch (err) {
    //   console.error(`Error attempting to move calling to ready queue ${err}`);
    // }
    // TODO: Email secretary that all approvals have been met and action is needed to move to next phase

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
