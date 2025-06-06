const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Função para listar notificações do usuário logado
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.userId; // ID do usuário logado

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc", // Ordenar pelas mais recentes
      },
      // Opcional: Limitar o número de notificações retornadas
      // take: 20,
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Get my notifications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Função para marcar uma ou todas as notificações como lidas
const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.userId; // ID do usuário logado
    const { notificationIds } = req.body; // Array de IDs de notificações para marcar como lidas, ou vazio para marcar todas

    let whereClause = {
      userId: userId,
      read: false, // Apenas notificações não lidas
    };

    if (notificationIds && notificationIds.length > 0) {
      whereClause.id = { in: notificationIds };
    }

    const { count } = await prisma.notification.updateMany({
      where: whereClause,
      data: {
        read: true,
      },
    });

    res.json({ message: `${count} notificações marcadas como lidas.` });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationsAsRead,
};
