"use strict";

const config = require("../config.json");

const express = require("express");
// const session = require("express-session");

const bodyParser = require("body-parser");
const tean = require("tean");

const security = require("./controllers/security.js");

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
app.use((req, res, next) => {
  // TEMP:
  if (!req.session) {
    req.session = {};
  }

  if (!req.session.hasOwnProperty("authLevel")) {
    req.session.authLevel = security.UNAUTHORIZED;
  }
  if (!req.session.hasOwnProperty("username")) {
    req.session.username = "Guest";
  }
  next();
});

app.use(bodyParser.json({type: "*/*"}));

require("./routes/approval.js").add(app);
require("./routes/callings.js").add(app);
require("./routes/calling.js").add(app);
require("./routes/login.js").add(app);

app.use((req, res, next) => {
  res.render("missing.pug");
})

app.listen(config.port);
console.log(`app listening on port ${config.port}`);
