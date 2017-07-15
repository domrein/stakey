"use strict";

const config = require("../../config.json");

const nodemailer = require("nodemailer");

const db = require("../controllers/database.js");

const smtpConfig = {
  host: "localhost",
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

transporter.verify((error, success) => {
  if (error) {
    console.error(`Mail server is not ready: ${error}`);
  }
  else {
    console.log("Mail server is ready to take our messages");
  }
});

module.exports = {
  async send(to, from, subject, text, html) {
    return new Promise((resolve, reject) => {
      console.log(`to: ${to}`);
      console.log(`from: ${from}`);
      console.log(`subject: ${subject}`);
      console.log(`text: ${text}`);
      console.log(`html: ${html}`);
      // don't send emails on dev
      if (process.env.NODE_ENV !== "dev") {
        transporter.sendMail({to, from, subject, text, html}, (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          }
          else {
            console.log("Message info:");
            console.log(info);
            resolve(null);
          }
        });
      }
      else {
        resolve(null);
      }
    });
  },

  async notifySecretary(name, position, state, id) {
    const secretaries = (await db.query(`
      SELECT email FROM users WHERE isSecretary = 1
    `, [])).map(r => r.email);
    
    let state1 = "";
    let state2 = "";
    let state3 = "";
    // TODO: make calling state defs instead of hard coding ints
    switch (state) {
        case 0:
          state1 = "All Stake Presidency approvals";
          state2 = "have been submitted";
          state3 = "send this calling to the High Council for approval";
          break;
        case 1:
          state1 = "All High Council approvals";
          state2 = "have been submitted";
          state3 = "assign someone to conduct the interview for this calling";
          break;
        case 2:
          state1 = "The interview";
          state2 = "has been completed";
          state3 = "conduct the sustaining for this calling";
          break;
        case 3:
          state1 = "The sustaining";
          state2 = "has been completed";
          state3 = "conduct the setting apart for this calling";
          break;
        case 4:
          state1 = "The setting apart";
          state2 = "has been completed";
          state3 = "complete this calling";
          break;
        default:
          throw new Error("INVALID_NOTIFICATION_STATE");
    }

    for (const secretary of secretaries) {
      await this.send(
        secretary,
        `callings@${config.hostName}`,
        "Calling Ready for Action",
        `${state1} for ${name} for ${position} ${state2}. Please visit ${config.host}/calling/${id} to ${state3}.`,
        `
          <p>${state1} for ${name} for ${position} ${state2}.</p>
          <p>Please visit <a href="${config.host}/calling/${id}">${config.host}/calling/${id}</a> to ${state3}.</p>
        `
      );
    }
  }
};
