const Conversation = require("../models/Conversation");

const ensureConversation = async (userA, userB) => {
  let convo = await Conversation.findOne({
    members: { $all: [userA, userB] },
  });

  if (!convo) {
    convo = await Conversation.create({
      members: [userA, userB],
    });
  }

  return convo;
};

module.exports = { ensureConversation };
