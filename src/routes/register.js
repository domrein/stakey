"use strict";

const config = require("../../config.json");

const tean = require("tean");
const crypto = require("crypto");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const code = require("../utils/code.js");

exports.add = app => {
  app.get("/register/:code", security.authorize(security.UNAUTHORIZED), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({code: "string(16)"}, req.params);
    }
    catch (err) {
      console.warn(err);
      // TODO: add an "oops" page instead of just 500
      res.status(400).send();
      return;
    }

    let rows = null;
    try {
      // TODO: think of a solution to prune expired codes
      rows = await db.query("SELECT id FROM registration WHERE code = ? AND expiration >= NOW() LIMIT 1", [data.code]);
    }
    catch (err) {
      // TODO: add an "oops" page instead of just 500
      console.error(err);
      res.status(500).send();
      return;
    }

    res.render("register.pug", {
      stake: config.stake.name,
      code: data.code,
      valid: !!rows.length,
    });
  });

  app.post("/register", security.authorize(security.UNAUTHORIZED), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({
        code: "string(16)",
        passwordHash: "string(32)",
        email: "email",
        firstName: "string(45)",
        lastName: "string(45)",
      }, req.body);
    }
    catch (err) {
      console.warn(err);
      // TODO: add an "oops" page instead of just 500
      res.status(400).send();
      return;
    }
    // TODO:
    // make sure code is valid
    let rows = null;
    try {
      // TODO: think of a solution to prune expired codes
      rows = await db.query("SELECT level FROM registration WHERE code = ? AND expiration >= NOW() LIMIT 1", [data.code]);
    }
    catch (err) {
      // TODO: add an "oops" page instead of just 500
      console.error(err);
      res.status(500).send();
      return;
    }

    if (rows.length) {
      const salt = code.generate(32);
      // create hash from password + salt

      const hash = crypto.createHash("sha512");
      hash.update(data.passwordHash);
      hash.update(salt);
      const passwordHash = hash.digest("hex");

      // add user
      try {
        await db.query(`
          INSERT INTO users (firstName, lastName, email, level, passwordHash, salt)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [data.firstName, data.lastName, data.email, rows[0].level, passwordHash, salt]);
      }
      catch (err) {
        // TODO: add an "oops" page instead of just 500
        console.error(err);
        res.status(500).send();
        return;
      }

      // log user in
      req.session.authLevel = rows[0].level;
      req.session.email = data.email;
      req.session.firstName = data.firstName;
      req.session.lastName = data.lastName;

      // delete code
      try {
        db.query("DELETE FROM registration WHERE code = ?", [data.code]);
      }
      catch (err) {
        console.error(err);
      }

      res.status(200).send();
    }
    else {
      res.status(400).send();
    }
  });
}
