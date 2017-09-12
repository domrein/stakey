"use strict";

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const render = require("../utils/render.js");
const fatal = require("../utils/fatal.js");
const invalid = require("../utils/invalid.js");

exports.add = app => {
  app.get("/users/", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let users = null;
    try {
      users = await db.query(`
        SELECT id, firstName, lastName, email, level, isSecretary
        FROM users
      `);
      users.forEach(u => {
        u.level = security.levelToName(u.level, true);
        u.isSecretary = u.isSecretary ? "Yes" : "No";
      });
    }
    catch (err) {
      fatal.render(err, res);
      return;
    }
    render(res, "users.pug", {
      username: security.getUsername(req),
      users,
    });
  });

  app.get("/users/:id", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({id: "int"}, req.params);
    }
    catch (err) {
      console.warn(err);
      render(res, "missing.pug");
      return;
    }

    let user = null;
    try {
      const rows = await db.query(`
        SELECT id, firstName, lastName, email, level, isSecretary
        FROM users
        WHERE id = ?
      `, [data.id]);
      if (!rows.length) {
        console.warn(err);
        render(res, "missing.pug");
        return;
      }
      user = rows[0];
    }
    catch (err) {
      fatal.render(err, res);
      return;
    }
    render(res, "user.pug", {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      level: user.level,
      isSecretary: user.isSecretary,

      levels: security.levels,
    });
  });

  app.put("/users/:id", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({id: "int"}, req.params);
      Object.assign(data, await tean.normalize({
        firstName: "string(45)",
        lastName: "string(45)",
        email: "email",
        level: "int(0,5)",
        isSecretary: "bool",
      }, req.body));
    }
    catch (err) {
      console.warn(err);
      invalid.reply(err, res);
      return;
    }

    try {
      await db.query(`
        UPDATE users SET
          firstName = ?,
          lastName = ?,
          email = ?,
          level = ?,
          isSecretary = ?
        WHERE id = ?
        LIMIT 1
      `, [
        data.firstName,
        data.lastName,
        data.email,
        data.level,
        data.isSecretary,
        data.id
      ]);
    }
    catch (err) {
      fatal.reply(err, res);
      return;
    }

    res.status(200).send();
  });
};
