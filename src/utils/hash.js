"use strict";

const crypto = require("crypto");

module.exports = {
  salt(salt, password) {
    const hash = crypto.createHash("sha512");
    hash.update(password);
    hash.update(salt);
    const passwordHash = hash.digest("hex");

    return passwordHash;
  },
};
