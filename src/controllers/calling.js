"use strict";

const db = require("../controllers/database.js");
 
 module.exports = {
  stateIdToName(id) {
    let name = "Unknown";
    switch (id) {
      case 0: name =  "Pending Stake Presidency Approval"; break;
      case 1: name =  "Pending High Council Approval"; break;
      case 2: name =  "Pending Interview"; break;
      case 3: name =  "Pending Sustaining"; break;
      case 4: name =  "Pending Setting Apart"; break;
      case 5: name =  "Complete"; break;
    }

    return name;
  },
  
  stateIdToAssignment(id) {
    let name = "Unknown";
    switch (id) {
      case 2: name =  "interview"; break;
      case 3: name =  "sustaining"; break;
      case 4: name =  "setting Apart"; break;
    }

    return name;
  },

  stateIdToAction(id) {
    let name = "unknown";
    switch (id) {
      case 2: name =  "interview"; break;
      case 3: name =  "sustain"; break;
      case 4: name =  "setApart"; break;
    }

    return name;
  },

  async advanceState(id) {
    return await db.query("UPDATE callings SET state = state + 1 WHERE id = ? AND state < 5", [id]);
  },
 };