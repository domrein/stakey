"use strict";

const tean = require("tean");

exports.add = (app, stakeyDb) => {
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
};
