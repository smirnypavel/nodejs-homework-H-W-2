const nodemailer = require("nodemailer");

function sendMail(email) {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c6c82f384071c6",
      pass: "e927183730eff7",
    },
  });
  return transport.sendMail({ ...email, from: "payalnic@ukr.net" });
}

module.exports = {
  sendMail,
};
