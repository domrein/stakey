"use strict";

const config = require("../../config.json");

const db = require("./database.js");
const security = require("./security");
const email = require("./email.js");
const code = require("../utils/code.js");

exports.generateApprovals = async callingId => {
  // get calling info
  let state = null;
  let candidate = null;
  let position = null;
  try {
    let rows = await db.query(`
      SELECT firstName, middleName, lastName, position, state
      FROM callings WHERE id = ?
    `, [callingId]);
    if (rows.length) {
      const [row] = rows;
      state = row.state;
      candidate = `${row.firstName} ${row.middleName} ${row.lastName}`;
      position = row.position;
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
  if (![0, 1].includes(state)) {
    console.error(`Cannot generate approvals for state ${state}`);
    throw new Error("INVALID_STATE");
  }
  
  let users = null;
  try {
    // pull all relevant approvers
    users = await db.query("SELECT id, email FROM users WHERE level = ?", [
      state === 0
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
      `, [emails.map(e => [callingId, state, e.id, e.code])]);

      emails.forEach(e => {
        try {
          email.send(
            e.email,
            `approvals@${config.hostname}`,
            "Calling Review",
            `Do you want to approve ${candidate} for ${position}? Approve: ${config.host}/approval/${e.code}?approved=true Discuss: ${config.host}/approval/${e.code}?approved=false`,
            `
            <p>Do you want to approve ${candidate} for ${position}?</p>
            <div><a href="${config.host}/approval/${e.code}?approved=true">Approve</a></div>
            <div><a href="${config.host}/approval/${e.code}?approved=false">Discuss</a></div>
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
