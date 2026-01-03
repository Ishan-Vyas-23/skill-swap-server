const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (to, otp) => {
  await resend.emails.send({
    from: "Skill Swap <onboarding@resend.dev>",
    to,
    subject: "Verify your Skill Swap account",
    html: `
      <p>Your verification code is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for 10 minutes.</p>
    `,
  });
};

module.exports = sendOTPEmail;
