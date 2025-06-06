const express = require("express");
const { getPlans, selectPlan } = require("../controllers/planController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação a todas as rotas de plano
router.use(authenticateToken);

// Rota para listar todos os planos disponíveis
router.get("/", getPlans);

// Rota para um usuário selecionar um plano
// Pode ser POST ou PUT, dependendo se sempre criamos uma nova assinatura ou atualizamos uma existente.
// Usaremos POST aqui para simplicidade na simulação.
router.post("/select", selectPlan);

module.exports = router;
