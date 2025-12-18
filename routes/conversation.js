const express = require("express");
const router = express.Router();

const authenticationMiddleware = require("../middleware/authentication");
const {
  loadConversation,
  myConversations,
} = require("../controllers/conversation");

router.route("/load").post(authenticationMiddleware, loadConversation);
router.route("/my-chats").get(authenticationMiddleware, myConversations);

module.exports = router;
