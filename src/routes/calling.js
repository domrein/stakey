"use strict";

const tean = require("tean");

exports.add = (app, stakeyDb) => {
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

  // view a specific calling
  app.get("/calling/:id", async (req, res, next) => {
    // TODO: require auth
    try {
      const data = await tean.normalize({id: "int"}, req.params);
      // look up all info for calling and put into read only mode
      stakeyDb.query(`
        SELECT
        id,
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
          next();
        }
        else {
          const calling = rows[0];
          res.render("calling.pug", {
            id: calling.id,
            viewMode: true,
            firstName: calling.firstName,
            middleName: calling.middleName,
            lastName: calling.lastName,
            position: calling.position,
            reason: calling.reason,
            templeWorthy: calling.templeWorthy === 1 ? true : calling.templeWorthy === false ? 0 : null,
            ward: calling.ward,
            currentCalling: calling.currentCalling,
            phoneNumber: calling.phoneNumber,
            bishopConsulted: !!calling.bishopConsulted,
            councilRepConsulted: !!calling.councilRepConsulted,
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
    }
  });

  // delete a calling
  app.delete("/calling/:id", async (req, res) => {
    // TODO: only admins should be able to delete a calling
    try {
      const data = await tean.normalize({id: "int"}, req.params);
      res.status(200).send();

      stakeyDb.query(`
        DELETE FROM callings WHERE id = ?
      `, [data.id], (err, result) => {
        if (err) {
          res.status(500).send();
        }
        else {
          res.status(200).send();
        }
      });
    }
    catch (err) {
      console.log(err);
      console.log(err.join());
      res.status(400).send();
    }
  });
};
