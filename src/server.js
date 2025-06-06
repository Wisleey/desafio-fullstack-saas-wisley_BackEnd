const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const taskRoutes = require("./routes/taskRoutes");
const planRoutes = require("./routes/planRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/notifications", notificationRoutes);

// Verificação de saúde (Health check)
app.get("/api/health", (req, res) => {
  res.json({
    message: "API está rodando!",
    timestamp: new Date().toISOString(),
  });
});

// Middleware de tratamento de erro (Error handling middleware)
app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.stack);
  res.status(500).json({
    message: "Algo deu errado!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Handler 404 (404 handler)
app.use("*", (req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
});
