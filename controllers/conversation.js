const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");

const { ensureConversation } = require("../services/conversationService");

const loadConversation = async (req, res) => {
  try {
    const senderID = req.user.userID;
    const { receiverID } = req.body;

    if (senderID === receiverID) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    const conversation = await ensureConversation(senderID, receiverID);

    return res.status(200).json({ conversation });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const myConversations = async (req, res) => {
  try {
    const { userID } = req.user;

    const myConversations = await Conversation.find({
      members: userID,
    })
      .sort({ updatedAt: -1 })
      .populate("members", "username");

    return res.status(200).json({ myConversations });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { loadConversation, myConversations };
