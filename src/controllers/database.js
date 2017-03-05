"use strict";

const config = require("../../config.json");

const mysql = require ("mysql");

const db = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

module.exports = {
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(rows);
        }
      });
    });
  }
};
