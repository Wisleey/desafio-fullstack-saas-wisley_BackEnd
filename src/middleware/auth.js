const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Token de acesso necessário" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica se o usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }

    console.error("Erro no middleware de autenticação:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = { authenticateToken };
