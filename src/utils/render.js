"use strict";

const config = require("../../config.json");

const defaults = {
  stake: config.stake.name,
};

module.exports = (res, page, params) => {
  res.render(page, Object.assign(params, defaults));
};
