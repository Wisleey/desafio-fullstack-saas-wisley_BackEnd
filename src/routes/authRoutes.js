const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Regras de validação (Validation rules)
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("O nome deve ter entre 2 e 50 caracteres"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Por favor, forneça um email válido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Por favor, forneça um email válido"),
  body("password").notEmpty().withMessage("A senha é obrigatória"),
];

// Rotas (Routes)
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/profile", authenticateToken, getProfile);

module.exports = router;
