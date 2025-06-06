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

// Validation rules
const createTaskValidation = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Task title must be between 2 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Task description must be between 5 and 1000 characters"),
  body("teamId").isUUID().withMessage("Valid team ID is required"),
  body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Valid due date is required"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];

const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Task title must be between 2 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage("Task description must be between 5 and 1000 characters"),
  body("status")
    .optional()
    .isIn(["pendente", "andamento", "concluída"])
    .withMessage("Status must be: pendente, andamento, or concluída"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post("/", createTaskValidation, createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTaskValidation, updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
