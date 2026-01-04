const mongoose = require("mongoose");
const bcrypt = require(`bcryptjs`);
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOTPEmail, sendResetEmail } = require("../utils/mail");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all values" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      otp: hashedOtp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    });

    await sendOTPEmail(email, otp);

    return res.status(201).json({
      message: "OTP sent to email. Please verify to continue.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all values" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify OTP first" });
    }

    const token = jwt.sign(
      {
        userID: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    const userData = {
      username: user.username,
      email: user.email,
    };

    return res
      .status(200)
      .json({ message: "Login successful", userData, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const userStats = async (req, res) => {
  try {
    const { userID } = req.user;
    const user = await User.findById(userID).select(
      "username likesCount dislikesCount"
    );

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please register again." });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please register again." });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== user.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      {
        userID: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    return res.status(200).json({
      message: "Account verified successfully",
      token,
      userData: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const sendResetOtp = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await sendResetEmail(userEmail, otp);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiresAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    return res.status(200).json({ message: "reset otp send to your email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userEmail, newPass, otp } = req.body;
    if (!userEmail || !newPass || !otp) {
      return res.status(400).json({ message: "Please provide all values" });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (!user.resetOtp || !user.resetOtpExpiresAt) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please try again." });
    }

    if (user.resetOtpExpiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please try again." });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== user.resetOtp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    const hashedPass = await bcrypt.hash(newPass, 10);

    user.password = hashedPass;
    user.resetOtp = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ message: "password reset succesfull" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  userStats,
  verifyOtp,
  sendResetOtp,
  resetPassword,
};
