const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { BadgerPersonality } = require('../models/BadgerPersonality');
const Joi = require('joi');
const logger = require('../utils/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation schemas
const createChallengeSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(1000).required(),
  type: Joi.string().valid('FITNESS', 'HABIT', 'LEARNING', 'CREATIVE', 'SOCIAL', 'CUSTOM').required(),
  difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD', 'EXTREME').default('MEDIUM'),
  deadline: Joi.date().iso().min('now').optional(),
  verificationMethod: Joi.string().valid('PHOTO', 'VIDEO', 'FITNESS_TRACKER', 'LOCATION', 'MANUAL', 'TIME_BASED', 'CHECKIN').required(),
  verificationData: Joi.object().optional(),
  rewardType: Joi.string().valid('MONEY', 'GIFT_CARD', 'MESSAGE', 'PHOTO', 'VIDEO', 'CUSTOM').required(),
  rewardAmount: Joi.number().min(0).when('rewardType', {
    is: Joi.string().valid('MONEY', 'GIFT_CARD'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  rewardMessage: Joi.string().max(500).optional(),
  rewardMedia: Joi.array().items(Joi.string().uri()).optional(),
  recipientEmail: Joi.string().email().required(),
  honeyBadgerId: Joi.string().required()
});

// Get all challenges for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { status, type, role } = req.query;
    
    // Build filter conditions
    const where = {
      OR: [
        { senderId: req.user.userId },
        { recipientId: req.user.userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (role === 'sent') {
      where.OR = [{ senderId: req.user.userId }];
    } else if (role === 'received') {
      where.OR = [{ recipientId: req.user.userId }];
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        },
        honeyBadger: {
          select: {
            id: true,
            name: true,
            personality: true,
            avatar: true,
            level: true
          }
        },
        progressUpdates: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      challenges
    });

  } catch (error) {
    logger.error('Error fetching challenges:', error);
    res.status(500).json({
      error: 'Failed to fetch challenges',
      message: 'An error occurred while retrieving challenges'
    });
  }
});

// Get specific challenge
router.get('/:id', async (req, res) => {
  try {
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { senderId: req.user.userId },
          { recipientId: req.user.userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        },
        honeyBadger: {
          select: {
            id: true,
            name: true,
            personality: true,
            avatar: true,
            level: true,
            experience: true
          }
        },
        progressUpdates: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        },
        chatMessages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            honeyBadger: {
              select: {
                id: true,
                name: true,
                personality: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({
        error: 'Challenge not found',
        message: 'The requested challenge does not exist or you do not have access to it'
      });
    }

    res.json({
      success: true,
      challenge
    });

  } catch (error) {
    logger.error('Error fetching challenge:', error);
    res.status(500).json({
      error: 'Failed to fetch challenge',
      message: 'An error occurred while retrieving the challenge'
    });
  }
});

// Create new challenge
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = createChallengeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const {
      title,
      description,
      type,
      difficulty,
      deadline,
      verificationMethod,
      verificationData,
      rewardType,
      rewardAmount,
      rewardMessage,
      rewardMedia,
      recipientEmail,
      honeyBadgerId
    } = value;

    // Find recipient user
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient not found',
        message: 'No user found with the provided email address'
      });
    }

    // Verify honey badger belongs to user and is available
    const honeyBadger = await prisma.honeyBadger.findFirst({
      where: {
        id: honeyBadgerId,
        ownerId: req.user.userId,
        isActive: true,
        challengeId: null // Must be available
      }
    });

    if (!honeyBadger) {
      return res.status(400).json({
        error: 'Honey badger not available',
        message: 'The selected honey badger is not available or does not belong to you'
      });
    }

    // Handle payment for monetary rewards
    let stripePaymentIntentId = null;
    if (rewardType === 'MONEY' && rewardAmount > 0) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(rewardAmount * 100), // Convert to cents
          currency: 'usd',
          automatic_payment_methods: {
            enabled: true
          },
          metadata: {
            type: 'challenge_reward',
            senderId: req.user.userId,
            recipientId: recipient.id
          }
        });
        stripePaymentIntentId = paymentIntent.id;
      } catch (stripeError) {
        logger.error('Stripe payment intent creation failed:', stripeError);
        return res.status(400).json({
          error: 'Payment setup failed',
          message: 'Unable to process payment for this challenge'
        });
      }
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        type,
        difficulty,
        deadline,
        verificationMethod,
        verificationData,
        rewardType,
        rewardAmount,
        rewardMessage,
        rewardMedia: rewardMedia || [],
        senderId: req.user.userId,
        recipientId: recipient.id,
        stripePaymentIntentId,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Assign honey badger to challenge
    await prisma.honeyBadger.update({
      where: {
        id: honeyBadgerId
      },
      data: {
        challengeId: challenge.id
      }
    });

    // Create initial greeting message from honey badger
    const personality = new BadgerPersonality(honeyBadger.personality);
    const greetingMessage = personality.getRandomPhrase('greeting');
    
    await prisma.chatMessage.create({
      data: {
        content: greetingMessage,
        messageType: 'TEXT',
        honeyBadgerId: honeyBadger.id,
        challengeId: challenge.id
      }
    });

    logger.info(`New challenge created: ${challenge.id} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challenge: {
        ...challenge,
        honeyBadger
      },
      paymentClientSecret: stripePaymentIntentId ? (await stripe.paymentIntents.retrieve(stripePaymentIntentId)).client_secret : null
    });

  } catch (error) {
    logger.error('Error creating challenge:', error);
    res.status(500).json({
      error: 'Failed to create challenge',
      message: 'An error occurred while creating the challenge'
    });
  }
});

// Accept challenge (recipient)
router.post('/:id/accept', async (req, res) => {
  try {
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: req.params.id,
        recipientId: req.user.userId,
        status: 'PENDING'
      },
      include: {
        honeyBadger: true
      }
    });

    if (!challenge) {
      return res.status(404).json({
        error: 'Challenge not found',
        message: 'Challenge not found or not available for acceptance'
      });
    }

    // Update challenge status
    const updatedChallenge = await prisma.challenge.update({
      where: {
        id: req.params.id
      },
      data: {
        status: 'ACTIVE',
        startedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        honeyBadger: true
      }
    });

    // Create acceptance message from honey badger
    if (challenge.honeyBadger) {
      const personality = new BadgerPersonality(challenge.honeyBadger.personality);
      const motivationMessage = personality.getRandomPhrase('motivation');
      
      await prisma.chatMessage.create({
        data: {
          content: `Great! Let's get started! ${motivationMessage}`,
          messageType: 'SYSTEM',
          honeyBadgerId: challenge.honeyBadger.id,
          challengeId: challenge.id
        }
      });
    }

    logger.info(`Challenge accepted: ${challenge.id} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Challenge accepted successfully',
      challenge: updatedChallenge
    });

  } catch (error) {
    logger.error('Error accepting challenge:', error);
    res.status(500).json({
      error: 'Failed to accept challenge',
      message: 'An error occurred while accepting the challenge'
    });
  }
});

// Submit progress update
router.post('/:id/progress', async (req, res) => {
  try {
    const { content, mediaUrls, metadata, progressPercent } = req.body;

    const challenge = await prisma.challenge.findFirst({
      where: {
        id: req.params.id,
        recipientId: req.user.userId,
        status: 'ACTIVE'
      },
      include: {
        honeyBadger: true
      }
    });

    if (!challenge) {
      return res.status(404).json({
        error: 'Challenge not found',
        message: 'Active challenge not found or you do not have access to it'
      });
    }

    // Create progress update
    const progressUpdate = await prisma.progressUpdate.create({
      data: {
        updateType: challenge.verificationMethod === 'PHOTO' ? 'PHOTO_VERIFICATION' : 
                   challenge.verificationMethod === 'VIDEO' ? 'VIDEO_VERIFICATION' : 'PROGRESS',
        content: content || 'Progress update submitted',
        mediaUrls: mediaUrls || [],
        metadata: metadata || {},
        progressPercent: progressPercent || 0,
        challengeId: challenge.id
      }
    });

    // Generate honey badger response
    if (challenge.honeyBadger) {
      const personality = new BadgerPersonality(challenge.honeyBadger.personality);
      let responseMessage;
      
      if (progressPercent >= 100) {
        responseMessage = personality.getRandomPhrase('celebration');
      } else if (progressPercent >= 50) {
        responseMessage = personality.getRandomPhrase('motivation');
      } else {
        responseMessage = personality.getRandomPhrase('encouragement') || personality.getRandomPhrase('motivation');
      }
      
      await prisma.chatMessage.create({
        data: {
          content: responseMessage,
          messageType: 'TEXT',
          honeyBadgerId: challenge.honeyBadger.id,
          challengeId: challenge.id
        }
      });
    }

    // Check if challenge is completed
    if (progressPercent >= 100) {
      await prisma.challenge.update({
        where: {
          id: challenge.id
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Update honey badger stats
      if (challenge.honeyBadger) {
        await prisma.honeyBadger.update({
          where: {
            id: challenge.honeyBadger.id
          },
          data: {
            successfulChallenges: {
              increment: 1
            },
            experience: {
              increment: 100
            }
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progressUpdate
    });

  } catch (error) {
    logger.error('Error submitting progress:', error);
    res.status(500).json({
      error: 'Failed to submit progress',
      message: 'An error occurred while submitting progress'
    });
  }
});

// Cancel challenge
router.post('/:id/cancel', async (req, res) => {
  try {
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: req.params.id,
        senderId: req.user.userId,
        status: {
          in: ['PENDING', 'ACTIVE']
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({
        error: 'Challenge not found',
        message: 'Challenge not found or cannot be cancelled'
      });
    }

    // Cancel challenge
    await prisma.challenge.update({
      where: {
        id: req.params.id
      },
      data: {
        status: 'CANCELLED'
      }
    });

    // Release honey badger
    if (challenge.honeyBadgerId) {
      await prisma.honeyBadger.update({
        where: {
          id: challenge.honeyBadgerId
        },
        data: {
          challengeId: null
        }
      });
    }

    logger.info(`Challenge cancelled: ${challenge.id} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Challenge cancelled successfully'
    });

  } catch (error) {
    logger.error('Error cancelling challenge:', error);
    res.status(500).json({
      error: 'Failed to cancel challenge',
      message: 'An error occurred while cancelling the challenge'
    });
  }
});

module.exports = router;