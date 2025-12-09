const mongoose = require("mongoose");
const bcrypt = require(`bcryptjs`);
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: "Please provide all values" });
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashPassword,
    });

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

    return res.status(201).json({ message: "user created", userData, token });
  } catch (error) {
    console.log(error);
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

module.exports = {
  register,
  login,
  userStats,
};
