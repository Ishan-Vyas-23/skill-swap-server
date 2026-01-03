const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Skill Swap" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your Skill Swap account",
    text: `Your verification code is ${otp}. It is valid for 10 minutes.`,
  });
};

module.exports = sendOTPEmail;
