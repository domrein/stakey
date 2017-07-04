"use strict";

var nodemailer = require("nodemailer");

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

exports.send = async (to, from, subject, text, html) => {
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
  });
};
