"use strict";

const tean = require("tean");
const crypto = require("crypto");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  app.get("/", security.authorize(security.HIGH_COUNCIL), async (req, res) => {
    res.render("home.pug", {
      canCreate: security.canCreateCalling(req),
      canRegister: security.canCreateRegistrationLink(req)});
  });
}
