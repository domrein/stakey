"use strict";

const config = require("../../config.json");

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");
const code = require("../utils/code.js");
const email = require("../controllers/email.js");

exports.add = app => {
  app.get("/registration", security.authorize(security.STAKE_PRESIDENCY), async (req, res) => {
    res.render("registration.pug", {stake: config.stake.name});
  });

  app.post("/registration", security.authorize(security.STAKE_PRESIDENCY), async (req, res) => {
    let data = null;
    try {
      data = await tean.normalize({
        role: "string(user,highCouncil,stakePresidency)",
        email: "email",
      }, req.body);
    }
    catch (err) {
      console.warn(err);
      // TODO: add an "oops" page instead of just 400
      res.status(400).send();
      return;
    }

    let registrationCode = code.generate(16);
    try {
      let level = 0;
      switch (data.role) {
        case "user": level = security.USER; break;
        case "highCouncil": level = security.HIGH_COUNCIL; break;
        case "stakePresidency": level = security.STAKE_PRESIDENCY; break;
        default:
          console.error(`Invalid role specified: ${data.role}`);
          res.status(500).send();
          return;
      }
      await db.query(`
        INSERT INTO registration (code, level, expiration)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
      `, [registrationCode, level]);
    }
    catch (err) {
      // TODO: add an "oops" page instead of just 500
      console.error(`Unable to write registration code to database: ${err}`);
      res.status(500).send();
      return;
    }

    try {
      email.send(data.email, "registration@stakey.paulmilham.com", "Please Register Your Account", `
        Congrats! You're almost ready to start using stakey. Follow this link ${config.host}/register/${registrationCode}
      `, `
        <h3>Congrats!</h3>
        <p>You're almost ready to start using stakey. Follow this link:&nbsp;<a href="${config.host}/register/${registrationCode}">${config.host}/register/${registrationCode}</a></p>
      `);
    }
    catch (err) {
      console.error(`Error sending registration email: ${err}`);
    }

    res.status(200).send();
  });
}
