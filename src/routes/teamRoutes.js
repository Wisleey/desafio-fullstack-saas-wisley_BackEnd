const express = require("express");
const { body } = require("express-validator");
const {
  createTeam,
  getTeams,
  getTeamById,
  addMember,
  removeMember,
  requestTeamMembership,
  getTeamMembers,
  updateTeam,
} = require("../controllers/teamController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const createTeamValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),
];

const addMemberValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post("/", createTeamValidation, createTeam);
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.post("/:id/members", addMemberValidation, addMember);
router.get("/:id/members", getTeamMembers);
router.post("/:id/request-membership", requestTeamMembership);
router.delete("/:id/members/:memberId", removeMember);

module.exports = router;
