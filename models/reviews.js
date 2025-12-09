const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    swapID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swap",
      required: true,
    },
    targetID: {
      ref: "User",
      type: mongoose.Types.ObjectId,
      required: true,
    },
    reviewerID: {
      ref: "User",
      type: mongoose.Types.ObjectId,
      required: true,
    },
    skillID: {
      ref: "Skills",
      type: mongoose.Types.ObjectId,
      required: true,
    },
    rating: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ swapID: 1, reviewerID: 1, targetID: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
