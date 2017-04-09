"use strict";

const tean = require("tean");
const crypto = require("crypto");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  app.get("/login", security.authorize(security.UNAUTHORIZED), (req, res) => {
    res.render("login.pug");
  });

  app.post("/login", security.authorize(security.UNAUTHORIZED), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({passwordHash: "string(32)", email: "email"}, req.body);
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    // load salt from db
    let salt = null;
    let passwordHash = null;
    let level = null;
    let email = null;
    let firstName = null;
    let lastName = null;
    try {
      const rows = await db.query(`
        SELECT salt, passwordHash, level, email, firstName, lastName FROM users WHERE email = ? LIMIT 1
      `, [data.email]);
      if (!rows.length) {
        res.status(401).send();
        return;
      }
      salt = rows[0].salt;
      passwordHash = rows[0].passwordHash;
      level = rows[0].level;
      email = rows[0].email;
      firstName = rows[0].firstName;
      lastName = rows[0].lastName;
    }
    catch(err) {
      // TODO: add an "oops" page instead of just 500
      res.status(500).send();
      return;
    }

    const hash = crypto.createHash("sha512");
    hash.update(data.passwordHash);
    hash.update(salt);
    // login success
    if (passwordHash === hash.digest("hex")) {
      req.session.authLevel = level;
      req.session.email = email;
      req.session.firstName = firstName;
      req.session.lastName = lastName;
      res.status(200).send();
    }
    else {
      res.status(401).send();
    }
  });
}
