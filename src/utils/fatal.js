"use strict";

const render = require("../utils/render.js");

module.exports = {
  render(err, res) {
    console.log(err);
    render(res, "oops.pug");
  },

  reply(err, res) {
    console.log(err);
    res.status(500).send();
  },
};
