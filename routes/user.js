const express = require("express");
const router = express.Router();

const {
  register,
  login,
  userStats,
  verifyOtp,
  sendResetOtp,
  resetPassword,
} = require("../controllers/user");
const authenticationMiddleware = require("../middleware/authentication");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-otp").post(sendResetOtp);
router.route("/reset-password").post(resetPassword);
router.route("/user-stats").get(authenticationMiddleware, userStats);

module.exports = router;
