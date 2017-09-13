"use strict";

const config = require("../../config.json");

const db = require("./database.js");
const security = require("./security");
const email = require("./email.js");
const code = require("../utils/code.js");

exports.generateApprovals = async callingId => {
  // get calling info
  let calling = null;
  try {
    let rows = await db.query(`
      SELECT firstName, middleName, lastName, position, state, ward, currentCalling, templeWorthy, reason
      FROM callings WHERE id = ?
    `, [callingId]);
    if (rows.length) {
      calling = rows[0];
    }
    else {
      console.error(`Calling with id ${callingId} does not exist`);
      throw new Error("CALLING_DOES_NOT_EXIST");
    }
  }
  catch (err) {
    console.error(`Unable pull state to generate approvals: ${err}`);
    throw err;
  }
  if (![0, 1].includes(calling.state)) {
    console.error(`Cannot generate approvals for state ${state}`);
    throw new Error("INVALID_STATE");
  }

  let users = null;
  try {
    // pull all relevant approvers
    users = await db.query("SELECT id, email FROM users WHERE level = ?", [
      calling.state === 0
        ? security.STAKE_PRESIDENCY
        : security.HIGH_COUNCIL
    ]);
  }
  catch (err) {
    console.error(err);
    throw new Error("UNABLE_TO_SEND_EMAIL");
  }

  // generate data for emails
  const emails = [];
  for (const user of users) {
    emails.push({email: user.email, code: code.generate(16), id: user.id});
  }

  if (emails.length) {
    try {
      // insert approvals
      await db.query(`
        INSERT INTO approvals (callingId, state, approverId, linkCode)
        VALUES ?
      `, [emails.map(e => [callingId, calling.state, e.id, e.code])]);

      const candidate = `${calling.firstName} ${calling.middleName} ${calling.lastName}`;
      const {name: ward = "Unknown"} = config.stake.wards.find(w => w.id === calling.ward) || {};

      emails.forEach(e => {
        try {
          email.send(
            e.email,
            `approvals@${config.hostname}`,
            "Calling Review",
            `Do you want to approve ${candidate} for ${calling.position}?
Ward: ${ward}
Current Calling: ${calling.currentCalling}
Temple Worthy: ${calling.templeWorthy ? "Yes" : "No"}
Reason: ${calling.reason}
Approve: ${config.host}/approval/${e.code}?approved=true
Discuss: ${config.host}/approval/${e.code}?approved=false
            `,
            `
            <p>Do you want to approve ${candidate} for ${calling.position}?</p>
            <div>Ward: ${ward}</div>
            <div>Current Calling: ${calling.currentCalling}</div>
            <div>Temple Worthy: ${calling.templeWorthy ? "Yes" : "No"}</div>
            <div>Reason: ${calling.reason}</div>
            <br><div><a href="${config.host}/approval/${e.code}?approved=true">Approve</a></div>
            <br><br><div><a href="${config.host}/approval/${e.code}?approved=false">Discuss</a></div>
            `,
          );
        }
        catch (err) {
          console.error(err);
          throw new Error("UNABLE_TO_SEND_EMAIL");
        }
      });
    }
    catch (err) {
      console.error(err);
      throw new Error("UNABLE_TO_SEND_EMAIL");
    }
  }
};
