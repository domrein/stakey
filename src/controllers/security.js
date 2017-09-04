"use strict";

const config = require("../../config.json");

module.exports = {
  UNAUTHORIZED: 0,
  USER: 1,
  HIGH_COUNCIL: 2,
  STAKE_PRESIDENCY: 3,
  ADMIN: 4,

  levelToName(level, capitalize = false) {
    let name = "unknown";
    switch (level) {
      case this.UNAUTHORIZED: name = capitalize ? "Unauthorized" : "unauthorized"; break;
      case this.USER: name = capitalize ? "User" : "user"; break;
      case this.HIGH_COUNCIL: name = capitalize ? "High Council": "high council"; break;
      case this.STAKE_PRESIDENCY: name = capitalize ? "Stake Presidency": "stake presidency"; break;
      case this.ADMIN: name = capitalize ? "Admin" : "admin"; break;
    }

    return name;
  },

  authorize(level) {
    return (req, res, next) => {
      if (req.session.authLevel < level) {
        if (!req.session.authLevel) {
          // TODO: save off link they wanted to navigate to, then redirect there on successful login (if link wasn't login)
          res.status(401).render("login.pug", {stake: config.stake.name});
        }
        else {
          res.status(403).render("forbidden.pug", {stake: config.stake.name});
        }
      }
      else {
        next();
      }
    };
  },

  getUsername(req) {
    if (!req.session.firstName && !req.session.lastName) {
      return "";
    }
    return `${req.session.firstName} ${req.session.lastName}`;
  },

  canCreateCalling(req) {
    return req.session.authLevel >= this.USER;
  },

  canDeleteCalling(req) {
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },

  canCreateRegistrationLink(req) {
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },

  canSkipStakeApproval(req) {
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },

  canUpdateCallingState(req) {
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },

  canManageUsers(req) {
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },
};
module.exports.levels = [
  {value: module.exports.UNAUTHORIZED, name: module.exports.levelToName(module.exports.UNAUTHORIZED, true)},
  {value: module.exports.USER, name: module.exports.levelToName(module.exports.USER, true)},
  {value: module.exports.HIGH_COUNCIL, name: module.exports.levelToName(module.exports.HIGH_COUNCIL, true)},
  {value: module.exports.STAKE_PRESIDENCY, name: module.exports.levelToName(module.exports.STAKE_PRESIDENCY, true)},
  {value: module.exports.ADMIN, name: module.exports.levelToName(module.exports.ADMIN, true)},
];
