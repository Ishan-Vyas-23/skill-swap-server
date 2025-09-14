const express = require("express");
const router = express.Router();

const {
  getAllSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  updateSwap,
} = require("../controllers/skills");

const authenticationMiddleware = require("../middleware/authentication");

router.route("/").get(getAllSkills).post(authenticationMiddleware, createSkill);

router
  .route("/:id")
  .get(getSkill)
  .patch(authenticationMiddleware, updateSkill)
  .delete(authenticationMiddleware, deleteSkill);

router.route("/swap/:id").patch(authenticationMiddleware, updateSwap);

module.exports = router;
