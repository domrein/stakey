"use strict";

const config = require("../../config.json");

const tean = require("tean");
const crypto = require("crypto");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const code = require("../utils/code.js");
const invalid = require("../utils/invalid.js");
const fatal = require("../utils/fatal.js");
const hash = require("../utils/hash.js");
const email = require("../controllers/email.js");

exports.add = app => {
  app.get("/passwordReset/:code", security.authorize(security.UNAUTHORIZED), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({code: "string(16)"}, req.params);
    }
    catch (err) {
      invalid.reply(err, res);
      return;
    }

    let rows = null;
    try {
      // TODO: think of a solution to prune expired codes
      rows = await db.query("SELECT id FROM resetPasswordLinks WHERE linkCode = ? AND expiration >= NOW() LIMIT 1", [data.code]);
    }
    catch (err) {
      fatal.reply(err, res);
      return;
    }

    res.render("passwordReset.pug", {
      stake: config.stake.name,
      code: data.code,
      valid: !!rows.length,
    });
  });

  app.delete("/passwordReset/:code", security.authorize(security.USER), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({code: "string(16)", passwordHash: "string(32)"}, req.body);
    }
    catch (err) {
      invalid.reply(err, res);
      return;
    }

    // look up user id
    let userId = null;
    try {
      const rows = await db.query(`
        SELECT userId FROM resetPasswordLinks WHERE linkCode = ? LIMIT 1
      `, [data.code]);
      if (rows.length) {
        userId = rows[0].userId;
      }
      else {
        invalid.reply(err, res);
        return;
      }
    }
    catch (err) {
      fatal.reply(err, res);
      return;
    }

    // update password
    try {
      const salt = code.generate(32);
      const passwordHash = hash.salt(salt, data.passwordHash);

      await db.query(`
        UPDATE users SET passwordHash = ?, salt = ? WHERE id = ? LIMIT 1
      `, [passwordHash, salt, userId]);
    }
    catch (err) {
      fatal.reply(err, res);
      return;
    }

    // delete password reset link
    try {
      await db.query(`
        DELETE FROM resetPasswordLinks WHERE linkCode = ? LIMIT 1
      `, [data.code]);
    }
    catch (err) {
      console.warn(`Error deleting password reset link with code ${data.code}: ${err}`);
    }

    res.status(200).send();
  });

  app.post("/passwordReset", security.authorize(security.STAKE_PRESIDENCY), async (req, res, next) => {
    let data = null;
    try {
      data = await tean.normalize({userId: "int"}, req.body);
    }
    catch (err) {
      console.warn(err);
      invalid.reply(err, res);
      return;
    }

    let userEmail = null;
    try {
      let results = await db.query(`
        SELECT email
        FROM users
        WHERE id = ?
        LIMIT 1
      `, [
        data.userId,
      ]);
      if (results.length) {
        userEmail = results[0].email;
      }
      else {
        invalid.reply(`Unable to find email for user id ${data.userId}`, res);
        return;
      }
    }
    catch (err) {
      fatal.reply(err, res);
      return;
    }

    const linkCode = code.generate(16);

    // create reset link
    try {
      await db.query(`
        INSERT INTO resetPasswordLinks (userId, linkCode, created, expiration)
        VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY))
      `, [data.userId, linkCode]);
    }
    catch (err) {
      fatal.reply(err, res);
      return;
    }

    // send email
    try {
      await email.send(userEmail, `forgotpassword@${config.hostname}`, "Password Reset Request", `
        You requested to reset your password. Please visit the following link to reset your password. ${config.host}/passwordReset/${linkCode}
      `, `
        <p>You requested to reset your password. Please visit the following link to reset your password.</p>
        <a href="${config.host}/passwordReset/${linkCode}">${config.host}/passwordReset/${linkCode}</a>
      `);
    }
    catch (err) {
      fatal.reply(err, res);
      return;
    }

    res.status(200).send();
  });
}
