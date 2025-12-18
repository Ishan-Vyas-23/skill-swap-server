const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const sendMessage = async (req, res) => {
  try {
    const senderID = req.user.userID;
    const { conversationID, messageText } = req.body;

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const conversation = await Conversation.findById(conversationID);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isMember = conversation.members.some(
      (memberId) => memberId.toString() === senderID
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const message = await Message.create({
      conversationID: conversationID,
      senderID: senderID,
      text: messageText,
    });

    conversation.lastMessage = messageText;
    conversation.lastSender = senderID;
    await conversation.save();

    return res.status(201).json({ message });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const userID = req.user.userID;
    const conversationID = req.params.conversationID;

    const conversation = await Conversation.findById(conversationID).populate(
      "members",
      "username"
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isMember = conversation.members.some(
      (member) => member._id.toString() === userID
    );

    const messages = await Message.find({
      conversationID: conversationID,
    }).sort({
      createdAt: 1,
    });

    const otherUser = conversation.members.find(
      (member) => member._id.toString() !== userID
    );

    return res
      .status(200)
      .json({ conversation, recieverName: otherUser, userID, messages });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { sendMessage, getConversationMessages };
