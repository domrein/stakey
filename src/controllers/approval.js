"use strict";

const db = require("./database.js");
const security = require("./security");

exports.generateApprovals = async callingId => {
  let users = null;
  try {
    // pull all high council users
    users = await db.query("SELECT id, email FROM users WHERE level = ?", [security.HIGH_COUNCIL]);
  }
  catch (err) {
    console.error(err);
    throw new Error("Unable to send emails");
  }

  // generate data for emails
  const emails = [];
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  for (const user of users) {
    let code = "";
    while (code.length < 16) {
      code += chars[~~(Math.random() * chars.length)];
    }
    emails.push({email: user.email, code, id: user.id});
  }

  try {
    // insert approvals
    await db.query(`
      INSERT INTO approvals (callingId, approverId, linkCode)
      VALUES ?
    `, [emails.map(e => [callingId, e.id, e.code])]);

    // TODO: send out emails
  }
  catch (err) {
    console.error(err);
    throw new Error("Unable to send emails");
  }
};
