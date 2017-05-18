"use strict";

module.exports = {
  UNAUTHORIZED: 0,
  HIGH_COUNCIL: 1,
  STAKE_PRESIDENCY: 2,
  ADMIN: 3,

  authorize(level) {
    return (req, res, next) => {
      if (req.session.authLevel < level) {
        if (!req.session.authLevel) {
          res.status(401).send();
        }
        else {
          res.status(403).send();
        }
      }
      else {
        next();
      }
    };
  },

  getUsername(req) {
    return `${req.session.firstName} ${req.session.lastName}`;
  },
};
