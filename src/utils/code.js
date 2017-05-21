"use strict";

const chars = "0123456789abcdefghijklmnopqrstuvwxyz";

module.exports = {
  generate(length) {
    let code = "";
    while (code.length < length) {
      code += chars[~~(Math.random() * chars.length)];
    }

    return code;
  }
};
