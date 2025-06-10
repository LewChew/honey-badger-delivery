const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { BadgerPersonality, PERSONALITY_TYPES } = require('../models/BadgerPersonality');
const authMiddleware = require('../middleware/auth');
const Joi = require('joi');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation schemas
const createBadgerSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  personality: Joi.string().valid(...PERSONALITY_TYPES).required()
});

// Get all honey badgers for the authenticated user
router.get('/', async (req, res) => {
  try {
    const honeyBadgers = await prisma.honeyBadger.findMany({
      where: {
        ownerId: req.user.userId,
        isActive: true
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            status: true,
            deadline: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Enhance badgers with personality info
    const enhancedBadgers = honeyBadgers.map(badger => {
      const personality = new BadgerPersonality(badger.personality);
      return {
        ...badger,
        personalityInfo: {
          name: personality.getName(),
          avatar: personality.getAvatar(),
          traits: personality.getTraits()
        }
      };
    });

    res.json({
      success: true,
      honeyBadgers: enhancedBadgers
    });

  } catch (error) {
    logger.error('Error fetching honey badgers:', error);
    res.status(500).json({
      error: 'Failed to fetch honey badgers',
      message: 'An error occurred while retrieving your honey badgers'
    });
  }
});

// Get specific honey badger
router.get('/:id', async (req, res) => {
  try {
    const honeyBadger = await prisma.honeyBadger.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.userId
      },
      include: {
        challenge: {
          include: {
            progressUpdates: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 10
            },
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            recipient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        chatMessages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 50,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!honeyBadger) {
      return res.status(404).json({
        error: 'Honey badger not found',
        message: 'The requested honey badger does not exist or does not belong to you'
      });
    }

    // Enhance with personality info
    const personality = new BadgerPersonality(honeyBadger.personality);
    const enhancedBadger = {
      ...honeyBadger,
      personalityInfo: {
        name: personality.getName(),
        avatar: personality.getAvatar(),
        traits: personality.getTraits()
      }
    };

    res.json({
      success: true,
      honeyBadger: enhancedBadger
    });

  } catch (error) {
    logger.error('Error fetching honey badger:', error);
    res.status(500).json({
      error: 'Failed to fetch honey badger',
      message: 'An error occurred while retrieving the honey badger'
    });
  }
});

// Create new honey badger
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = createBadgerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { name, personality } = value;

    // Check if user already has too many active badgers (limit to 5)
    const activeBadgerCount = await prisma.honeyBadger.count({
      where: {
        ownerId: req.user.userId,
        isActive: true
      }
    });

    if (activeBadgerCount >= 5) {
      return res.status(400).json({
        error: 'Badger limit reached',
        message: 'You can only have up to 5 active honey badgers at a time'
      });
    }

    // Create personality instance for avatar
    const personalityInstance = new BadgerPersonality(personality);
    
    // Create honey badger
    const honeyBadger = await prisma.honeyBadger.create({
      data: {
        name,
        personality,
        avatar: personalityInstance.getAvatar(),
        ownerId: req.user.userId
      }
    });

    // Enhance with personality info
    const enhancedBadger = {
      ...honeyBadger,
      personalityInfo: {
        name: personalityInstance.getName(),
        avatar: personalityInstance.getAvatar(),
        traits: personalityInstance.getTraits()
      }
    };

    logger.info(`New honey badger created: ${honeyBadger.id} for user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Honey badger created successfully',
      honeyBadger: enhancedBadger
    });

  } catch (error) {
    logger.error('Error creating honey badger:', error);
    res.status(500).json({
      error: 'Failed to create honey badger',
      message: 'An error occurred while creating your honey badger'
    });
  }
});

// Update honey badger
router.put('/:id', async (req, res) => {
  try {
    const updateSchema = Joi.object({
      name: Joi.string().min(1).max(50).optional()
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    // Check if honey badger exists and belongs to user
    const existingBadger = await prisma.honeyBadger.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.userId
      }
    });

    if (!existingBadger) {
      return res.status(404).json({
        error: 'Honey badger not found',
        message: 'The requested honey badger does not exist or does not belong to you'
      });
    }

    // Update honey badger
    const updatedBadger = await prisma.honeyBadger.update({
      where: {
        id: req.params.id
      },
      data: value
    });

    // Enhance with personality info
    const personality = new BadgerPersonality(updatedBadger.personality);
    const enhancedBadger = {
      ...updatedBadger,
      personalityInfo: {
        name: personality.getName(),
        avatar: personality.getAvatar(),
        traits: personality.getTraits()
      }
    };

    res.json({
      success: true,
      message: 'Honey badger updated successfully',
      honeyBadger: enhancedBadger
    });

  } catch (error) {
    logger.error('Error updating honey badger:', error);
    res.status(500).json({
      error: 'Failed to update honey badger',
      message: 'An error occurred while updating your honey badger'
    });
  }
});

// Deactivate honey badger (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    // Check if honey badger exists and belongs to user
    const existingBadger = await prisma.honeyBadger.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.userId
      },
      include: {
        challenge: {
          select: {
            status: true
          }
        }
      }
    });

    if (!existingBadger) {
      return res.status(404).json({
        error: 'Honey badger not found',
        message: 'The requested honey badger does not exist or does not belong to you'
      });
    }

    // Check if honey badger is currently assigned to an active challenge
    if (existingBadger.challenge && existingBadger.challenge.status === 'ACTIVE') {
      return res.status(400).json({
        error: 'Cannot delete active honey badger',
        message: 'This honey badger is currently working on an active challenge'
      });
    }

    // Soft delete by setting isActive to false
    await prisma.honeyBadger.update({
      where: {
        id: req.params.id
      },
      data: {
        isActive: false
      }
    });

    logger.info(`Honey badger deactivated: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Honey badger retired successfully'
    });

  } catch (error) {
    logger.error('Error deleting honey badger:', error);
    res.status(500).json({
      error: 'Failed to retire honey badger',
      message: 'An error occurred while retiring your honey badger'
    });
  }
});

// Get available personality types
router.get('/personalities/types', (req, res) => {
  try {
    const personalities = PERSONALITY_TYPES.map(type => {
      const personality = new BadgerPersonality(type);
      return {
        type,
        name: personality.getName(),
        description: personality.config.description,
        avatar: personality.getAvatar(),
        traits: personality.getTraits()
      };
    });

    res.json({
      success: true,
      personalities
    });

  } catch (error) {
    logger.error('Error fetching personality types:', error);
    res.status(500).json({
      error: 'Failed to fetch personality types'
    });
  }
});

module.exports = router;