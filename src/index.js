"use strict";

const config = require("../config.json");

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require ("mysql");
const tean = require("tean");

const stakeyDb = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

tean.addBaseTypes();

const app = express();

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

app.use("/public", express.static(`${__dirname}/public`));

// BUG: the default session store is in memory
//   it does not scale beyound a single process
//   implement redis sessions https://www.npmjs.com/package/connect-redis
// app.use(session({
//   secret: crypto.generateSalt(50),
// })); // BUG: This secret generation will break if we have multiple processes

// make sure session data is initialized
// app.use((req, res, next) => {
//   if (!req.session.userData) {
//     req.session.userData = {authLevel: validate.authLevels.GUEST};
//   }
//   if (!req.session.userData.hasOwnProperty("username")) {
//     req.session.userData.username = "";
//   }
//   next();
// });

app.use(bodyParser.json({type: "*/*"}));

require("./routes/callings.js").add(app, stakeyDb);
require("./routes/calling.js").add(app, stakeyDb);
require("./routes/approval.js").add(app, stakeyDb);

app.use((req, res, next) => {
  res.render("missing.pug");
})

app.listen(config.port);
console.log(`app listening on port ${config.port}`);
