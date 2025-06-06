const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Regras de validação
const createTaskValidation = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("O título da tarefa deve ter entre 2 e 200 caracteres"),
  body("description")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("A descrição da tarefa deve ter entre 5 e 1000 caracteres"),
  body("teamId").isUUID().withMessage("ID do time válido é obrigatório"),
  body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Data de vencimento válida é obrigatória"),
  body("priority")
    .optional()
    .isIn(["baixa", "média", "alta"])
    .withMessage("A prioridade deve ser: baixa, média ou alta"),
];

const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("O título da tarefa deve ter entre 2 e 200 caracteres"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("A descrição da tarefa deve ter entre 5 e 1000 caracteres"),
  body("status")
    .optional()
    .isIn(["pendente", "andamento", "concluída"])
    .withMessage("O status deve ser: pendente, andamento ou concluída"),
];

// Aplica autenticação em todas as rotas
router.use(authenticateToken);

// Rotas
router.post("/", createTaskValidation, createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTaskValidation, updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
