"use strict";

const tean = require("tean");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  // view all callings
  app.get("/login", security.authorize(security.UNAUTHORIZED), (req, res) => {
    res.render("login.pug");
  });

  app.post("/login", security.authorize(security.UNAUTHORIZED), async (req, res) => {
    try {
      const data = await tean.normalize({passwordHash: "string(32)", email: "email"}, req.body);
    }
    catch (err) {
      console.warn(err);
      res.status(400).send();
      return;
    }

    // add salt to passed password
    // hash it
    // see if it matches for the given email
    // if it does, update session
  });
}
