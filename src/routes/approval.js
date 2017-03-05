"use strict";

const tean = require("tean");

const db = require("../controllers/database.js");

exports.add = app => {
  app.get("/approval/:linkCode", async (req, res, next) => {
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
    console.log("-----------");
    console.log(data);
    // look up current approval state
    let approval = null;
    try {
      approval = await db.query(`
        SELECT c.firstName, c.middleName, c.lastName, c.position, a.approved, a.id
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

    if (data.approved !== null) {
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

    res.render("approval.pug", {
      approved: approval.approved,
      newApproved: data.approved === null ? data.approved : data.approved === true ? 1 : 0,
      candidate: `${approval.firstName} ${approval.middleName} ${approval.lastName}`,
      position: approval.position,
    });
  });
};
