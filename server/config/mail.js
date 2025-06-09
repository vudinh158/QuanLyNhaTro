const nodemailer = require("nodemailer");

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  throw new Error("Thiếu GMAIL_USER hoặc GMAIL_PASS trong .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

module.exports = transporter;
