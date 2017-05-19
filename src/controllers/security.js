"use strict";

module.exports = {
  UNAUTHORIZED: 0,
  USER: 1,
  HIGH_COUNCIL: 2,
  STAKE_PRESIDENCY: 3,
  ADMIN: 4,

  authorize(level) {
    return (req, res, next) => {
      if (req.session.authLevel < level) {
        if (!req.session.authLevel) {
          // TODO: save off link they wanted to navigate to, then redirect there on successful login (if link wasn't login)
          res.status(401).render("login.pug");
        }
        else {
          res.status(403).render("forbidden.pug");
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
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },

  canDeleteCalling(req) {
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },

  canCreateRegistrationLink(req) {
    return req.session.authLevel >= this.STAKE_PRESIDENCY;
  },
};
