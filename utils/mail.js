const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL,
  name: "Skill Swap",
};

const sendOTPEmail = async (to, otp) => {
  await sgMail.send({
    to,
    from: FROM,
    subject: "Verify your Skill Swap account",
    html: `
      <p>Your verification code is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for 10 minutes.</p>
    `,
  });
};

const sendResetEmail = async (to, otp) => {
  await sgMail.send({
    to,
    from: FROM,
    subject: "Reset your Skill Swap account password",
    html: `
      <p>Your OTP to reset your account password is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for 10 minutes.</p>
    `,
  });
};

module.exports = { sendOTPEmail, sendResetEmail };
