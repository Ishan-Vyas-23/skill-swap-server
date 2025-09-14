const mongoose = require("mongoose");
const Skills = require("../models/skills");
const user = require("../models/user");

const getAllSkills = async (req, res) => {
  try {
    const obj = await Skills.find({});
    if (obj.length === 0) {
      return res.status(200).json({ message: "No skills found" });
    }
    res.status(200).json({ obj, length: obj.length });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSkill = async (req, res) => {
  try {
    const id = req.params.id;
    const obj = await Skills.findOne({ _id: id });
    if (!obj) {
      return res.status(404).json({ message: "Skill not found" });
    }
    return res.status(200).json({ obj });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createSkill = async (req, res) => {
  try {
    const { skill, proficiency, yearsOfExperience, portfolio } = req.body;
    if (!skill || !proficiency || !yearsOfExperience || !portfolio) {
      return res.status(400).json({ message: "Please provide all values" });
    }
    req.body.user = req.user.userID;
    req.body.username = req.user.username;
    req.body.userEmail = req.user.email;
    const obj = await Skills.create(req.body);
    res.status(201).json({ obj });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateSkill = async (req, res) => {
  try {
    const { proficiency, yearsOfExperience, portfolio } = req.body;
    const id = req.params.id;
    const userID = req.user.userID;
    if (!proficiency || !yearsOfExperience || !portfolio) {
      return res.status(400).json({ message: "Please provide all values" });
    }
    const obj = await Skills.findOneAndUpdate(
      { _id: id, user: userID },
      { proficiency, yearsOfExperience, portfolio },
      { new: true, runValidators: true }
    );
    if (!obj) {
      return res.status(404).json({ message: "Skill not found" });
    }
    return res.status(200).json({ obj });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const id = req.params.id;
    const userID = req.user.userID;
    const obj = await Skills.findOneAndDelete({ _id: id, user: userID });
    if (!obj) {
      return res.status(404).json({ message: "Skill not found" });
    }
    return res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateSwap = async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email } = req.user;

    const obj = await Skills.findOneAndUpdate(
      {
        _id: id,
        "swappedBy.email": { $ne: email }, // ← only if user hasn't swapped yet
      },
      {
        $inc: { swap: 1 },
        $addToSet: {
          // ← like push, but prevents duplicates
          swappedBy: { username, email, swappedAt: new Date() },
        },
      },
      { new: true, runValidators: true }
    );
    if (!obj) {
      const skillExists = await Skills.exists({ _id: id });
      if (skillExists) {
        return res
          .status(409)
          .json({ message: "You've already swapped this skill." });
      } else {
        return res.status(404).json({ message: "Skill not found." });
      }
    }

    return res.status(200).json({ obj });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  updateSwap,
};
