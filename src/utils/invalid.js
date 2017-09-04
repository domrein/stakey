"use strict";

module.exports = {
  reply(err, res) {
    console.log(err);
    res.status(400).send();
  },
};
