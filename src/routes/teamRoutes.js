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
  deleteTeam,
} = require("../controllers/teamController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Regras de validação
const createTeamValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("O nome do time deve ter entre 2 e 100 caracteres"),
];

const addMemberValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Por favor, forneça um email válido"),
];

// Aplica autenticação em todas as rotas
router.use(authenticateToken);

// Rotas
router.post("/", createTeamValidation, createTeam);
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);
router.post("/:id/members", addMemberValidation, addMember);
router.get("/:id/members", getTeamMembers);
router.post("/:id/request-membership", requestTeamMembership);
router.delete("/:id/members/:memberId", removeMember);

module.exports = router;
