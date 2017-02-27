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

// VIEWS
// create a new calling
app.get("/calling", (req, res) => {
  // TODO: require auth
  res.render("calling.pug", {
    // TEST DATA
    // firstName: "Paul",
    // middleName: "Timothy",
    // lastName: "Milham",
    // position: "Stake Cookie Tester",
    // reason: "Because he is the best cookie taster in town.",
    // templeWorthy: true,
    // ward: "mb2",
    // currentCalling: "Stake Technology Specialist",
    // phoneNumber: "801-830-7917",
    // bishopConsulted: true,
    // councilRepConsulted: false,
  });
});

// view all callings
app.get("/callings", (req, res) => {
  // TODO: require auth
  // pull all the stuff from the database
  stakeyDb.query(`
    SELECT
    	c.id,
      c.firstName,
      c.lastName,
      c.position,
      c.state,
      (
		    SELECT COUNT(id)
        FROM approvals a
        WHERE a.callingId = c.id AND a.approved = 1
    	) AS approvalCount,
      (
  		  SELECT COUNT(id)
        FROM approvals a
        WHERE a.callingId = c.id AND a.approved = 0
    	) AS denialCount
    FROM callings c
    WHERE c.state != 2
  `, [], (err, rows) => {
    if (err) {
      res.status(500).send();
    }
    else {
      // display in table
      res.render("callings.pug", {
        pendingCallings: rows.filter(r => r.state === 0),
        readyCallings: rows.filter(r => r.state === 1),
      });
    }
  });
});

// view a specific calling
app.get("/calling/:id", async (req, res) => {
  // TODO: require auth
  try {
    const data = await tean.normalize({id: "int"}, req.params);
    // look up all info for calling and put into read only mode
    stakeyDb.query(`
      SELECT
      firstName,
      middleName,
      lastName,
      position,
      reason,
      templeWorthy,
      ward,
      currentCalling,
      phoneNumber,
      bishopConsulted,
      councilRepConsulted
      FROM callings WHERE id = ? LIMIT 1
    `, [data.id], (err, rows) => {
      if (err) {
        res.status(500).send();
      }
      else if (!rows.length) {
        res.status(404).send();
      }
      else {
        res.render("calling.pug", {
          viewMode: true,
          firstName: rows[0].firstName,
          middleName: rows[0].middleName,
          lastName: rows[0].lastName,
          position: rows[0].position,
          reason: rows[0].reason,
          templeWorthy: rows[0].templeWorthy === 1 ? true : rows[0].templeWorthy === false ? 0 : null,
          ward: rows[0].ward,
          currentCalling: rows[0].currentCalling,
          phoneNumber: rows[0].phoneNumber,
          bishopConsulted: !!rows[0].bishopConsulted,
          councilRepConsulted: !!rows[0].councilRepConsulted,
        });
      }
    });
  }
  catch (err) {
    console.log(err);
    res.status(400).send();
  }
});

app.get("approval/:id/:state", (req, res) => {
  // look up current approval state
  // once link has been used, it's deleted and the approval is created
  res.render("approval.pug", {
    state: 0,
  });
});

// API CALLS
// create a new calling
app.post("/calling", async (req, res) => {
  try {
    const data = await tean.normalize({
      firstName: "string(45)",
      middleName: "string(45)",
      lastName: "string(45)",
      position: "string(45)",
      reason: "string(255)",
      templeWorthy: "bool!null",
      ward: "string(mb2,mb3,t3,t8,t13,t14,t15)",
      currentCalling: "string(45)",
      phoneNumber: "string(45)",
      bishopConsulted: "bool",
      councilRepConsulted: "bool",
    }, req.body);

    // massage data for database
    if (data.templeWorthy === false) {
      data.templeWorthy = 0;
    }
    else if (data.templeWorthy === true) {
      data.templeWorthy = 1;
    }
    data.bishopConsulted = data.bishopConsulted ? 1 : 0;
    data.councilRepConsulted = data.councilRepConsulted ? 1 : 0;

    stakeyDb.query(`
      INSERT INTO callings (
        firstName,
        middleName,
        lastName,
        position,
        reason,
        templeWorthy,
        ward,
        currentCalling,
        phoneNumber,
        bishopConsulted,
        councilRepConsulted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.firstName,
      data.middleName,
      data.lastName,
      data.position,
      data.reason,
      data.templeWorthy,
      data.ward,
      data.currentCalling,
      data.phoneNumber,
      data.bishopConsulted,
      data.councilRepConsulted,
    ], err => {
      if (err) {
        console.log(err);
        res.status(500).send();
      }
      else {
        res.send();
      }
    });
  }
  catch (err) {
    console.log(err);
    console.log(err.join());
    res.status(400).send();
    return;
  }
});

app.listen(config.port);
console.log(`app listening on port ${config.port}`);
