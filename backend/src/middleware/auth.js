const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token - user not found'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    logger.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isVerified: true
      }
    });

    req.user = user ? {
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified
    } : null;

    next();

  } catch (error) {
    // On any error, just proceed without user context
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
module.exports.optional = optionalAuthMiddleware;