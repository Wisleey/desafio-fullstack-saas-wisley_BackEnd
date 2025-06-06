const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()
const prisma = new PrismaClient()

// Apply authentication to all routes
router.use(authenticateToken)

// Get all users (for team member selection)
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    res.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
