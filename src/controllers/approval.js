"use strict";

const db = require("./database.js");
const security = require("./security");
const code = require("../utils/code.js");

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
  for (const user of users) {
    emails.push({email: user.email, code: code.generate(16), id: user.id});
  }

  try {
    // insert approvals
    await db.query(`
      INSERT INTO approvals (callingId, approverId, linkCode)
      VALUES ?
    `, [emails.map(e => [callingId, e.id, e.code])]);

    // TODO: send out emails
    console.log(emails.map(e => `user: ${e.email} code: ${e.code}`));
  }
  catch (err) {
    console.error(err);
    throw new Error("Unable to send emails");
  }
};
