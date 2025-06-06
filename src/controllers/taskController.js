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

    // Check if team exists and user is a member
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
        .json({ message: "Team not found or access denied" });
    }

    // If assignedToId is provided, check if user is a team member
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
          .json({ message: "Assigned user is not a member of this team" });
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
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Internal server error" });
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
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
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
        .json({ message: "Task not found or access denied" });
    }

    res.json({ task });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Internal server error" });
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

    // Check if task exists and user has access
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
        .json({ message: "Task not found or access denied" });
    }

    // If assignedToId is provided, check if user is a team member
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
          .json({ message: "Assigned user is not a member of this team" });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
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

    // Check if task exists and user has access
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
        .json({ message: "Task not found or access denied" });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
