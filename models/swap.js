const mongoose = require("mongoose");

const SwapSchema = new mongoose.Schema(
  {
    initiatorID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetSkillID: {
      type: mongoose.Types.ObjectId,
      ref: "Skills",
      required: true,
    },
    initiatorSkillID: {
      type: mongoose.Types.ObjectId,
      ref: "Skills",
      default: null,
    },
    status: {
      type: String,
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Swap", SwapSchema);
