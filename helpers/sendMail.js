require("dotenv").config();
const nodemailer = require("nodemailer");

const { MAILER_USER, MAILER_PASS } = process.env;

function sendMail(email) {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILER_USER,
      pass: MAILER_PASS,
    },
  });
  return transport.sendMail({ ...email, from: "payalnic@ukr.net" });
}

module.exports = {
  sendMail,
};
