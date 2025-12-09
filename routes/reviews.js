const express = require("express");
const router = express.Router();

const authenticationMiddleware = require("../middleware/authentication");

const {
  like,
  dislike,
  writeReview,
  getMyReviews,
} = require("../controllers/reviews");

router.route("/like").post(authenticationMiddleware, like);
router.route("/dislike").post(authenticationMiddleware, dislike);
router.route("/write-review").patch(authenticationMiddleware, writeReview);
router.route("/get-user-reviews").get(authenticationMiddleware, getMyReviews);

module.exports = router;
