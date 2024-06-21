const nodemailer = require("nodemailer");

require("dotenv").config();

async function sendResetPwdVerification(recipient, user) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: recipient,
    subject: "Сonfirmation password reset on the vm-euro2024.vercel.app",
    html: `<div>
                <h2><strong>Hello ${user.username}</strong><h2>
                 <h3>To confirm reset your password 
                  <a href="https://vm-euro2024.vercel.app/auth/reset/${user.verificationToken}">click here</a>
                 </h3>
              </div>`,
  });
}

module.exports = sendResetPwdVerification;
