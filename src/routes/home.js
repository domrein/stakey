"use strict";

const config = require("../../config.json");

const tean = require("tean");
const crypto = require("crypto");

const db = require("../controllers/database.js");
const security = require("../controllers/security.js");

exports.add = app => {
  app.get("/", security.authorize(security.USER), async (req, res) => {
    res.render("home.pug", {
      stake: config.stake.name,
      username: security.getUsername(req),
      canCreate: security.canCreateCalling(req),
      canRegister: security.canCreateRegistrationLink(req),
      canManageUsers: security.canManageUsers(req),
    });
  });
}
