const express = require("express");
const router = express.Router();

const authenticationMiddleware = require("../middleware/authentication");
const {
  sendMessage,
  getConversationMessages,
} = require("../controllers/message");

router.route("/send").post(authenticationMiddleware, sendMessage);
router
  .route("/chat-messages/:conversationID")
  .get(authenticationMiddleware, getConversationMessages);

module.exports = router;
