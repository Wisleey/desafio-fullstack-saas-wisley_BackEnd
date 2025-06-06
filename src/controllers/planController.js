const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Função para listar todos os planos disponíveis
const getPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: "asc", // Ordenar por preço, por exemplo
      },
    });
    res.json({ plans });
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Função para um usuário selecionar (ou atualizar) seu plano
const selectPlan = async (req, res) => {
  try {
    const { planId } = req.body; // Recebe o ID do plano escolhido
    const userId = req.userId; // ID do usuário logado (assumindo que req.userId está disponível)

    // Opcional: Verificar se o plano existe
    const planExists = await prisma.plan.count({
      where: { id: planId },
    });

    if (!planExists) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }

    // Atualiza o registro do usuário com o planId escolhido
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        planId: planId,
      },
      select: {
        // Opcional: Retornar apenas alguns campos do usuário
        id: true,
        name: true,
        email: true,
        plan: {
          // Incluir informações do plano selecionado
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    res.json({ message: "Plano selecionado com sucesso!", user: updatedUser });
  } catch (error) {
    console.error("Select plan error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getPlans,
  selectPlan,
};
