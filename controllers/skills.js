const mongoose = require("mongoose");
const Skills = require("../models/skills");
const user = require("../models/user");
const Swap = require("../models/swap");
const Reviews = require("../models/reviews");

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
    return res.status(200).json({ obj, length: obj.length });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const userSkills = async (req, res) => {
  try {
    const { id } = req.params;

    const obj = await Skills.find({ user: id });

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
    const skillID = req.params.id;
    const { userID, username, email } = req.user;

    const obj = await Skills.findById(skillID);
    if (!obj) {
      return res.status(404).json({ message: "skill not found" });
    }

    const ownerID = obj.user;

    const exisitng = await Swap.findOne({
      initiatorID: userID,
      targetID: ownerID,
      targetSkillID: skillID,
      status: "pending",
    });

    if (exisitng) {
      return res.status(409).json({ message: "already swapped this skill !" });
    }

    const swap = await Swap.create({
      initiatorID: userID,
      targetID: ownerID,
      targetSkillID: skillID,
    });

    await Skills.findOneAndUpdate(
      {
        _id: skillID,
        "swappedBy.email": { $ne: email },
      },
      {
        $inc: { swap: 1 },
        $addToSet: {
          swappedBy: { username, email, swappedAt: new Date() },
        },
      }
    );

    return res.status(201).json({ swap });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getIncomingRequest = async (req, res) => {
  try {
    const userID = req.user.userID;

    const swaps = await Swap.find({
      targetID: userID,
      status: "pending",
    })
      .populate("initiatorID", "username email")
      .populate("targetSkillID", "skill");

    return res.status(200).json({ swaps });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchInitiatorSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Swap.findById(id);
    if (!skill) {
      res.status(400).json({ message: "no swap found" });
    }
    const initiatorID = skill.initiatorID;
    const obj = await Skills.find({ user: initiatorID });

    return res.status(200).json({ obj });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const acceptSwap = async (req, res) => {
  try {
    const { id } = req.params;
    const { initiatorSkillID } = req.body;
    const { userID } = req.user;

    if (!initiatorSkillID) {
      return res.status(400).json({ message: "initiatorSkillID required" });
    }

    const swap = await Swap.findById(id);

    if (!swap) return res.status(404).json({ message: "no swap found" });
    if (swap.targetID.toString() !== userID.toString())
      return res.status(403).json({ message: "not allowed" });
    if (swap.status !== "pending")
      return res.status(400).json({ message: "swap already processed" });

    swap.initiatorSkillID = initiatorSkillID;
    swap.status = "accepted";

    await swap.save();

    const updatedSwap = await Swap.findById(id)
      .populate("initiatorID", "username email")
      .populate("targetID", "username email")
      .populate("initiatorSkillID", "skill")
      .populate("targetSkillID", "skill");

    return res.status(200).json({ swap: updatedSwap });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const rejectSwap = async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req.user;
    const swap = await Swap.findById(id);
    if (!swap) {
      return res.status(404).json({ message: "no swap found" });
    }
    if (swap.targetID.toString() != userID.toString()) {
      return res
        .status(403)
        .json({ message: "not allowed to accept the swap" });
    }
    if (swap.status != "pending") {
      return res.status(400).json({ message: "swap already processed" });
    }

    swap.status = "rejected";

    await swap.save();
    return res.status(200).json({ swap });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMutuals = async (req, res) => {
  try {
    const { userID } = req.user;
    const mutuals = await Swap.find({
      status: "accepted",
      initiatorSkillID: { $ne: null },
      $or: [{ targetID: userID }, { initiatorID: userID }],
    })
      .populate("initiatorID", "username email")
      .populate("targetID", "username email")
      .populate("initiatorSkillID", "skill")
      .populate("targetSkillID", "skill");

    const mutualIDs = mutuals.map((s) => s._id);
    const myReviews = await Reviews.find({
      reviewerID: userID,
      swapID: { $in: mutualIDs },
    }).select("swapID rating");
    return res.status(200).json({ obj: mutuals, myReviews });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllSkills,
  getSkill,
  userSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  updateSwap,
  getIncomingRequest,
  fetchInitiatorSkills,
  acceptSwap,
  rejectSwap,
  getMutuals,
};
