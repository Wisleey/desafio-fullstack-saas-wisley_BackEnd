const express = require("express");
const {
  getMyNotifications,
  markNotificationsAsRead,
} = require("../controllers/notificationController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação a todas as rotas de notificação
router.use(authenticateToken);

// Rota para listar as notificações do usuário logado
router.get("/me", getMyNotifications);

// Rota para marcar notificações como lidas
router.post("/mark-read", markNotificationsAsRead);

module.exports = router;
