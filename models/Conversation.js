const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: [(arr) => arr.length === 2, "Conversation must have 2 members"],
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ members: 1 });
ConversationSchema.index({ updatedAt: -1 });
module.exports = mongoose.model("Conversation", ConversationSchema);
