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
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ message: "Internal server error" });
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
    console.error("Get teams error:", error);
    res.status(500).json({ message: "Internal server error" });
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
        .json({ message: "Team not found or access denied" });
    }

    res.json({ team });
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({ message: "Internal server error" });
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

    // Check if team exists and user is a member
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
        .json({ message: "Team not found or access denied" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: user.id,
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this team" });
    }

    // Add member
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
      message: "Member added successfully",
      member,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // Check if team exists and user is a member
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
        .json({ message: "Team not found or access denied" });
    }

    // Remove member
    const deletedMember = await prisma.teamMember.deleteMany({
      where: {
        teamId: id,
        userId: memberId,
      },
    });

    if (deletedMember.count === 0) {
      return res.status(404).json({ message: "Member not found in this team" });
    }

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const requestTeamMembership = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if team exists
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
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: id,
        userId: req.userId,
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "You are already a member of this team" });
    }

    // Add member
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
      message: "Successfully joined the team",
      member,
    });
  } catch (error) {
    console.error("Request team membership error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Nova função para listar membros de um time
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
        .json({ message: "Team not found or access denied" });
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
    console.error("Get team members error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Nova função para atualizar um time
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
        .json({ message: "Team not found or access denied" });
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

    res.json({ message: "Team updated successfully", team: updatedTeam });
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({ message: "Internal server error" });
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
    console.error("Delete team error:", error);
    res.status(500).json({ message: "Internal server error" });
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
  deleteTeam, // Exportar a nova função
};
