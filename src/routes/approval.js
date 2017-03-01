"use strict";

const tean = require("tean");

exports.add = (app, stakeyDb) => {
  app.get("approval/:id/:state", (req, res) => {
    // look up current approval state
    // once link has been used, it's deleted and the approval is created
    res.render("approval.pug", {
      state: 0,
    });
  });
};
