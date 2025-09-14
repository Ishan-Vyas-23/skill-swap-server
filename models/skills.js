const mongoose = require("mongoose");

const skillsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      ref: "User",
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    proficiency: {
      type: String,
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
    },
    portfolio: {
      type: String,
      required: true,
    },
    swap: {
      type: Number,
      default: 0,
    },
    swappedBy: [
      {
        username: String,
        email: String,
        swappedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Skills", skillsSchema);
