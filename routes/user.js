const express = require("express");
const router = express.Router();

const { register, login, userStats } = require("../controllers/user");
const authenticationMiddleware = require("../middleware/authentication");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user-stats").get(authenticationMiddleware, userStats);
module.exports = router;
