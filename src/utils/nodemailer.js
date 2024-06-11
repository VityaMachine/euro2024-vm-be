const nodemailer = require("nodemailer");

require("dotenv").config();

async function sendEmailVerification(recipient, user) {
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

  // await transporter.sendMail({
  //   from: process.env.MAIL_USER,
  //   to: recipient,
  //   subject: "Сonfirmation of registration on the vm-football.com",
  //   html: `<div>
  //               <strong>Hello ${user.username}</strong>
  //                <div>To confirm your email, <a href="https://euro2024-vm-be.onrender.com/users/verify/${user.verificationToken}">click here</a></div>
  //             </div>`,
  // });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: recipient,
    subject: "Сonfirmation of registration on the vm-football.com",
    html: `<div>
                <h3><strong>Hello ${user.username}</strong><h3>
                 <h5>To confirm your email, <a href="https://euro2024-vm-be.onrender.com/users/verify/${user.verificationToken}">click here</a></h5>
              </div>`,
  });
}

module.exports = sendEmailVerification;
