"use strict";

const config = require("../config.json");

const express = require("express");
const session = require("express-session");

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
let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let secret = "";
while (secret.length < 32) {
  secret += chars[~~Math.random() * chars.length];
}
app.use(session({secret})); // BUG: This secret generation will break if we have multiple processes

// make sure session data is initialized
app.use((req, res, next) => {
  // populate defaults
  req.session = req.session || {};
  req.session.authLevel = req.session.authLevel || security.UNAUTHORIZED;
  req.session.firstName = req.session.firstName || "Guest";
  req.session.lastName = req.session.lastName || "User";

  // no security mode
  if (process.env.NODE_ENV === "dev" && process.argv[2] === "nosecurity") {
    // TODO: find out why this is logging twice for every route
    console.log("APPLICATION IS UNSECURED");
    req.session.authLevel = security.ADMIN;
    req.session.firstName = "DEVELOPER";
    req.session.lastName = "MODE";
  }

  next();
});

app.use(bodyParser.json({type: "*/*"}));

require("./routes/approval.js").add(app);
require("./routes/calling.js").add(app);
require("./routes/callings.js").add(app);
require("./routes/history.js").add(app);
require("./routes/home.js").add(app);
require("./routes/login.js").add(app);
require("./routes/register.js").add(app);
require("./routes/registration.js").add(app);

app.use((req, res, next) => {
  res.render("missing.pug", {stake: config.stake.name});
})

app.listen(config.port);
console.log(`app listening on port ${config.port}`);
