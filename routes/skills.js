const express = require("express");
const router = express.Router();

const {
  getAllSkills,
  getSkill,
  userSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  updateSwap,
  getIncomingRequest,
  fetchInitiatorSkills,
  acceptSwap,
  rejectSwap,
  getMutuals,
} = require("../controllers/skills");

const authenticationMiddleware = require("../middleware/authentication");

router.route("/").get(getAllSkills).post(authenticationMiddleware, createSkill);
router
  .route("/get-user-profile/:email")
  .get(authenticationMiddleware, userSkills);

router
  .route("/:id")
  .get(getSkill)
  .patch(authenticationMiddleware, updateSkill)
  .delete(authenticationMiddleware, deleteSkill);
router.route("/swap/:id").patch(authenticationMiddleware, updateSwap);
router.route("/swap/:id/accept").patch(authenticationMiddleware, acceptSwap);
router.route("/swap/:id/reject").patch(authenticationMiddleware, rejectSwap);
// router.route("/requests/fetch/:id").get(authenticationMiddleware, userSkills);
router.route("/swap/mutuals").get(authenticationMiddleware, getMutuals);
router
  .route("/requests/fetch")
  .get(authenticationMiddleware, getIncomingRequest);
router
  .route("/request/fetch/:id")
  .get(authenticationMiddleware, fetchInitiatorSkills);

module.exports = router;
