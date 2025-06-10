const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { BadgerPersonality } = require('../models/BadgerPersonality');
const logger = require('../utils/logger');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store active connections
const activeConnections = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();

  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

// Handle socket connections
const handleConnection = (socket) => {
  logger.info(`User connected: ${socket.user.username} (${socket.userId})`);
  
  // Store connection
  activeConnections.set(socket.userId, socket);

  // Join user-specific room
  socket.join(`user_${socket.userId}`);

  // Handle joining challenge rooms
  socket.on('join_challenge', async (challengeId) => {
    try {
      // Verify user has access to this challenge
      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challengeId,
          OR: [
            { senderId: socket.userId },
            { recipientId: socket.userId }
          ]
        }
      });

      if (!challenge) {
        socket.emit('error', {
          message: 'Access denied to challenge'
        });
        return;
      }

      socket.join(`challenge_${challengeId}`);
      socket.emit('joined_challenge', {
        challengeId,
        message: 'Successfully joined challenge chat'
      });

      logger.info(`User ${socket.userId} joined challenge ${challengeId}`);

    } catch (error) {
      logger.error('Error joining challenge:', error);
      socket.emit('error', {
        message: 'Failed to join challenge'
      });
    }
  });

  // Handle leaving challenge rooms
  socket.on('leave_challenge', (challengeId) => {
    socket.leave(`challenge_${challengeId}`);
    socket.emit('left_challenge', {
      challengeId,
      message: 'Left challenge chat'
    });
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { challengeId, content, messageType = 'TEXT', mediaUrl } = data;

      // Verify user has access to this challenge
      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challengeId,
          OR: [
            { senderId: socket.userId },
            { recipientId: socket.userId }
          ]
        },
        include: {
          honeyBadger: true,
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
      });

      if (!challenge) {
        socket.emit('error', {
          message: 'Access denied to challenge'
        });
        return;
      }

      // Create message in database
      const message = await prisma.chatMessage.create({
        data: {
          content,
          messageType,
          mediaUrl,
          senderId: socket.userId,
          challengeId
        },
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
      });

      // Broadcast message to challenge room
      socket.to(`challenge_${challengeId}`).emit('new_message', {
        ...message,
        isOwn: false
      });

      // Send confirmation to sender
      socket.emit('message_sent', {
        ...message,
        isOwn: true
      });

      // Generate honey badger response if appropriate
      if (challenge.honeyBadger && challenge.status === 'ACTIVE') {
        setTimeout(async () => {
          try {
            const badgerResponse = await generateBadgerResponse(
              challenge.honeyBadger,
              content,
              challenge,
              socket.user
            );

            if (badgerResponse) {
              const badgerMessage = await prisma.chatMessage.create({
                data: {
                  content: badgerResponse,
                  messageType: 'TEXT',
                  honeyBadgerId: challenge.honeyBadger.id,
                  challengeId
                },
                include: {
                  honeyBadger: {
                    select: {
                      id: true,
                      name: true,
                      personality: true,
                      avatar: true
                    }
                  }
                }
              });

              // Broadcast badger message to challenge room
              socket.to(`challenge_${challengeId}`).emit('new_message', {
                ...badgerMessage,
                isOwn: false,
                isBadger: true
              });

              socket.emit('new_message', {
                ...badgerMessage,
                isOwn: false,
                isBadger: true
              });
            }
          } catch (error) {
            logger.error('Error generating badger response:', error);
          }
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      }

      logger.info(`Message sent in challenge ${challengeId} by user ${socket.userId}`);

    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', {
        message: 'Failed to send message'
      });
    }
  });

  // Handle honey badger poke/interaction
  socket.on('poke_badger', async (data) => {
    try {
      const { challengeId } = data;

      const challenge = await prisma.challenge.findFirst({
        where: {
          id: challengeId,
          recipientId: socket.userId,
          status: 'ACTIVE'
        },
        include: {
          honeyBadger: true
        }
      });

      if (!challenge || !challenge.honeyBadger) {
        return;
      }

      const personality = new BadgerPersonality(challenge.honeyBadger.personality);
      const pokeResponse = personality.getRandomPhrase('checkIn');

      const badgerMessage = await prisma.chatMessage.create({
        data: {
          content: pokeResponse,
          messageType: 'TEXT',
          honeyBadgerId: challenge.honeyBadger.id,
          challengeId
        },
        include: {
          honeyBadger: {
            select: {
              id: true,
              name: true,
              personality: true,
              avatar: true
            }
          }
        }
      });

      socket.emit('new_message', {
        ...badgerMessage,
        isOwn: false,
        isBadger: true
      });

    } catch (error) {
      logger.error('Error handling badger poke:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { challengeId } = data;
    socket.to(`challenge_${challengeId}`).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const { challengeId } = data;
    socket.to(`challenge_${challengeId}`).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      isTyping: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.user.username} (${socket.userId})`);
    activeConnections.delete(socket.userId);
  });
};

// Generate AI-powered honey badger response
const generateBadgerResponse = async (honeyBadger, userMessage, challenge, user) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to pre-defined responses if no OpenAI key
      const personality = new BadgerPersonality(honeyBadger.personality);
      return personality.getRandomPhrase('motivation');
    }

    const personality = new BadgerPersonality(honeyBadger.personality);
    const systemPrompt = personality.getSystemPrompt();

    const context = {
      challengeTitle: challenge.title,
      challengeDescription: challenge.description,
      challengeType: challenge.type,
      userFirstName: user.firstName,
      badgerName: honeyBadger.name,
      badgerLevel: honeyBadger.level
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nContext: You are ${honeyBadger.name}, a level ${honeyBadger.level} honey badger helping ${user.firstName} with their challenge "${challenge.title}". The challenge is about: ${challenge.description}. Keep responses short (1-2 sentences), energetic, and true to your personality.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    return completion.choices[0]?.message?.content || personality.getRandomPhrase('motivation');

  } catch (error) {
    logger.error('Error generating AI badger response:', error);
    // Fallback to pre-defined responses
    const personality = new BadgerPersonality(honeyBadger.personality);
    return personality.getRandomPhrase('motivation');
  }
};

// Send notification to user if they're online
const sendNotificationToUser = (userId, notification) => {
  const userSocket = activeConnections.get(userId);
  if (userSocket) {
    userSocket.emit('notification', notification);
  }
};

// Main socket handler
const socketHandler = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  // Handle connections
  io.on('connection', handleConnection);

  logger.info('Socket.io server initialized');
};

module.exports = socketHandler;
module.exports.sendNotificationToUser = sendNotificationToUser;
module.exports.activeConnections = activeConnections;