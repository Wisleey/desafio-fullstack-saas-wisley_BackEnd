const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

const createTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const ownerId = req.userId;

    const team = await prisma.team.create({
      data: {
        name,
        ownerId,
        members: {
          create: {
            userId: ownerId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Time criado com sucesso",
      team,
    });
  } catch (error) {
    console.error("Erro ao criar time:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ teams });
  } catch (error) {
    console.error("Erro ao buscar times:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: "Time não encontrado ou acesso negado" });
    }

    res.json({ team });
  } catch (error) {
    console.error("Erro ao buscar time:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const addMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email } = req.body;

    // Verifica se o time existe e o usuário é membro
    const team = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: "Time não encontrado ou acesso negado" });
    }

    // Encontra usuário por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Usuário não encontrado com este email" });
    }

    // Verifica se o usuário já é membro
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: user.id,
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Usuário já é membro deste time" });
    }

    // Adiciona membro
    const member = await prisma.teamMember.create({
      data: {
        teamId: id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Membro adicionado com sucesso",
      member,
    });
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // Verifica se o time existe e o usuário é membro
    const team = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: "Time não encontrado ou acesso negado" });
    }

    // Remove membro
    const deletedMember = await prisma.teamMember.deleteMany({
      where: {
        teamId: id,
        userId: memberId,
      },
    });

    if (deletedMember.count === 0) {
      return res
        .status(404)
        .json({ message: "Membro não encontrado neste time" });
    }

    res.json({ message: "Membro removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const requestTeamMembership = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o time existe
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ message: "Time não encontrado" });
    }

    // Verifica se o usuário já é membro
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: req.userId,
      },
    });

    if (existingMember) {
      return res.status(400).json({ message: "Você já é membro deste time" });
    }

    // Adiciona membro
    const member = await prisma.teamMember.create({
      data: {
        teamId: id,
        userId: req.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Juntou-se ao time com sucesso",
      member,
    });
  } catch (error) {
    console.error("Erro ao solicitar adesão ao time:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Função para listar membros de um time
const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params; // id do time

    // Verificar se o time existe e se o usuário logado é membro dele
    const team = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: req.userId,
          },
        },
      },
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: "Time não encontrado ou acesso negado" });
    }

    // Buscar os membros do time com as informações do usuário
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: id,
      },
      include: {
        user: {
          select: {
            // Selecionar apenas os campos necessários do usuário
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Retornar a lista de membros (incluindo as informações do usuário)
    res.json({ members: teamMembers });
  } catch (error) {
    console.error("Erro ao buscar membros do time:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Função para atualizar um time
const updateTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params; // id do time a ser atualizado
    const { name, description } = req.body; // Dados para atualização

    // Verificar se o time existe e se o usuário logado é o proprietário
    const team = await prisma.team.findFirst({
      where: {
        id,
        ownerId: req.userId, // Apenas o proprietário pode editar
      },
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: "Time não encontrado ou acesso negado" });
    }

    // Atualizar o time
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }), // Permitir descrição vazia
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tasks: true,
      },
    });

    res.json({ message: "Time atualizado com sucesso", team: updatedTeam });
  } catch (error) {
    console.error("Erro ao atualizar time:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Nova função para excluir um time
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params; // id do time a ser excluído

    // Verificar se o time existe e se o usuário logado é o proprietário
    const team = await prisma.team.findFirst({
      where: {
        id,
        ownerId: req.userId, // Apenas o proprietário pode excluir
      },
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: "Time não encontrado ou acesso negado" });
    }

    // Excluir o time (as tasks e teamMembers devem ser excluídos em cascata pelo schema.prisma)
    await prisma.team.delete({
      where: { id },
    });

    res.json({ message: "Time excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir time:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  addMember,
  removeMember,
  requestTeamMembership,
  getTeamMembers,
  updateTeam,
  deleteTeam,
};
