const mongoose = require("mongoose");
const User = require("../models/user");
const Reviews = require("../models/reviews");
const Swap = require("../models/swap");

const like = async (req, res) => {
  try {
    const { userID } = req.user;
    const { swapID } = req.body;
    const match = await Swap.findById(swapID);
    if (!match) {
      return res.status(404).json({ message: "mutual not found" });
    }
    if (
      match.initiatorID.toString() !== userID.toString() &&
      match.targetID.toString() !== userID.toString()
    ) {
      return res.status(403).json({ message: "not part of this swap" });
    }
    if (match.status !== "accepted") {
      return res.status(400).json({ message: "cannot review this swap yet" });
    }

    const isInitiator = match.initiatorID.toString() === userID.toString();
    const targetID = isInitiator ? match.targetID : match.initiatorID;
    const skillID = isInitiator ? match.targetSkillID : match.initiatorSkillID;

    let review = await Reviews.findOne({
      swapID,
      reviewerID: userID,
      targetID,
    });
    const targetUser = await User.findById(targetID);
    const prevRating = review ? review.rating : null;
    const newRating = "like";

    if (prevRating === newRating) {
      return res.status(200).json({ message: "already liked" });
    }
    let statusCode = 200;
    if (review) {
      review.rating = "like";
      await review.save();
    } else {
      review = await Reviews.create({
        swapID,
        reviewerID: userID,
        targetID,
        skillID,
        rating: "like",
        message: "",
      });
      statusCode = 201;
    }

    if (!prevRating) {
      targetUser.likesCount += 1;
    } else if (prevRating == "dislike") {
      targetUser.likesCount += 1;
      targetUser.dislikesCount -= 1;
    }

    await targetUser.save();

    return res.status(statusCode).json({ review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "internal server error" });
  }
};

const dislike = async (req, res) => {
  try {
    const { userID } = req.user;
    const { swapID } = req.body;
    const match = await Swap.findById(swapID);
    if (!match) {
      return res.status(404).json({ message: "mutual not found" });
    }
    if (
      match.initiatorID.toString() !== userID.toString() &&
      match.targetID.toString() !== userID.toString()
    ) {
      return res.status(403).json({ message: "not part of this swap" });
    }
    if (match.status !== "accepted") {
      return res.status(400).json({ message: "cannot review this swap yet" });
    }

    const isInitiator = match.initiatorID.toString() === userID.toString();
    const targetID = isInitiator ? match.targetID : match.initiatorID;
    const skillID = isInitiator ? match.targetSkillID : match.initiatorSkillID;

    let review = await Reviews.findOne({
      swapID,
      reviewerID: userID,
      targetID,
    });
    const targetUser = await User.findById(targetID);
    const prevRating = review ? review.rating : null;
    const newRating = "dislike";

    if (prevRating === newRating) {
      return res.status(200).json({ message: "already disliked" });
    }
    let statusCode = 200;
    if (review) {
      review.rating = "dislike";
      await review.save();
    } else {
      review = await Reviews.create({
        swapID,
        reviewerID: userID,
        targetID,
        skillID,
        rating: "dislike",
        message: "",
      });
      statusCode = 201;
    }

    if (!prevRating) {
      targetUser.dislikesCount += 1;
    } else if (prevRating == "like") {
      targetUser.likesCount -= 1;
      targetUser.dislikesCount += 1;
    }

    await targetUser.save();

    return res.status(statusCode).json({ review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "internal server error" });
  }
};

const writeReview = async (req, res) => {
  try {
    const { swapID } = req.body;
    const { userID } = req.user;

    const message = req.body.message?.trim();

    if (!message) {
      return res
        .status(400)
        .json({ message: "Review message cannot be empty" });
    }

    if (message.length > 500) {
      return res
        .status(413)
        .json({ message: "Review message exceeds 500 character limit" });
    }

    const review = await Reviews.findOne({
      swapID: swapID,
      reviewerID: userID,
    });
    review.message = message;
    await review.save();
    return res.status(200).json({ review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "internal server error" });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const { userID } = req.user;

    const reviews = await Reviews.find({
      targetID: userID,
      message: { $ne: "" },
    })
      .populate("reviewerID", "username")
      .populate("skillID", "skill")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "internal server error" });
  }
};

module.exports = { like, dislike, writeReview, getMyReviews };
