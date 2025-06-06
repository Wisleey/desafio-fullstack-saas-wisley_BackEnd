const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.userId = decoded.userId
    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" })
    }

    console.error("Auth middleware error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = { authenticateToken }
