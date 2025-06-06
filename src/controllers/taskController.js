const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, teamId, assignedToId, dueDate, priority } =
      req.body;

    // Verifica se o time existe e o usuário é membro
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
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

    // Se assignedToId for fornecido, verifica se o usuário é membro do time
    if (assignedToId) {
      const assignedUser = await prisma.teamMember.findFirst({
        where: {
          teamId,
          userId: assignedToId,
        },
      });

      if (!assignedUser) {
        return res
          .status(400)
          .json({ message: "Usuário atribuído não é membro deste time" });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        teamId,
        assignedToId,
        dueDate,
        priority,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Tarefa criada com sucesso",
      task,
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const getTasks = async (req, res) => {
  try {
    const { teamId, status, assignedToMe } = req.query;

    const whereClause = {};

    if (teamId) {
      whereClause.teamId = teamId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (assignedToMe === "true") {
      whereClause.assignedToId = req.userId;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ tasks });
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        team: {
          members: {
            some: {
              userId: req.userId,
            },
          },
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Tarefa não encontrada ou acesso negado" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, status, assignedToId } = req.body;

    // Verifica se a tarefa existe e o usuário tem acesso
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        team: {
          members: {
            some: {
              userId: req.userId,
            },
          },
        },
      },
    });

    if (!existingTask) {
      return res
        .status(404)
        .json({ message: "Tarefa não encontrada ou acesso negado" });
    }

    // Se assignedToId for fornecido, verifica se o usuário é membro do time
    if (assignedToId) {
      const assignedUser = await prisma.teamMember.findFirst({
        where: {
          teamId: existingTask.teamId,
          userId: assignedToId,
        },
      });

      if (!assignedUser) {
        return res
          .status(400)
          .json({ message: "Usuário atribuído não é membro deste time" });
      }
    }

    // Buscar a tarefa existente novamente com assignedTo incluído para criar a notificação
    const taskBeforeUpdate = await prisma.task.findUnique({
      where: { id },
      select: {
        status: true,
        title: true,
        assignedToId: true,
        assignedTo: {
          select: {
            email: true,
          },
        },
      },
    });

    // Realiza a atualização da tarefa
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // --- Lógica para criar Notificação In-App ---
    // Verificar se o status mudou E se a tarefa está atribuída a um usuário
    if (
      status !== undefined &&
      status !== taskBeforeUpdate?.status &&
      task.assignedToId
    ) {
      try {
        await prisma.notification.create({
          data: {
            userId: task.assignedToId,
            message: `O status da tarefa "${task.title}" foi alterado para "${task.status}".`,
          },
        });
        console.log(
          `Notificação criada para o usuário ${task.assignedToId} sobre a tarefa ${task.id}`
        );
      } catch (notificationError) {
        console.error("Erro ao criar notificação:", notificationError);
      }
    }
    // --- Fim da Lógica de Notificação ---

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se a tarefa existe e o usuário tem acesso
    const task = await prisma.task.findFirst({
      where: {
        id,
        team: {
          members: {
            some: {
              userId: req.userId,
            },
          },
        },
      },
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Tarefa não encontrada ou acesso negado" });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: "Tarefa excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
