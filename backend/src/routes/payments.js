const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create payment intent for challenge reward
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', challengeId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    // Convert to cents
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        userId: req.user.userId,
        challengeId: challengeId || '',
        type: 'challenge_reward'
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({
      error: 'Payment setup failed',
      message: 'Unable to process payment setup'
    });
  }
});

// Confirm payment and release funds
router.post('/confirm-payment/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { paymentIntentId } = req.body;

    // Verify challenge exists and is completed
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: challengeId,
        senderId: req.user.userId,
        status: 'COMPLETED',
        stripePaymentIntentId: paymentIntentId
      },
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!challenge) {
      return res.status(404).json({
        error: 'Challenge not found',
        message: 'Challenge not found or not eligible for payment'
      });
    }

    // Confirm the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Payment successful - could implement transfer to recipient here
      logger.info(`Payment confirmed for challenge ${challengeId}: ${paymentIntent.id}`);
      
      res.json({
        success: true,
        message: 'Payment processed successfully',
        paymentStatus: paymentIntent.status
      });
    } else {
      res.status(400).json({
        error: 'Payment failed',
        message: `Payment status: ${paymentIntent.status}`
      });
    }

  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({
      error: 'Payment confirmation failed',
      message: 'Unable to confirm payment'
    });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`Payment succeeded: ${paymentIntent.id}`);
      
      // Update challenge payment status if applicable
      if (paymentIntent.metadata.challengeId) {
        try {
          await prisma.challenge.update({
            where: {
              id: paymentIntent.metadata.challengeId
            },
            data: {
              // Could add payment confirmation timestamp or status
            }
          });
        } catch (error) {
          logger.error('Error updating challenge payment status:', error);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.warn(`Payment failed: ${failedPayment.id}`);
      break;
      
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        senderId: req.user.userId,
        stripePaymentIntentId: {
          not: null
        }
      },
      include: {
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const paymentHistory = challenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      amount: challenge.rewardAmount,
      recipient: challenge.recipient,
      status: challenge.status,
      createdAt: challenge.createdAt,
      completedAt: challenge.completedAt,
      paymentIntentId: challenge.stripePaymentIntentId
    }));

    res.json({
      success: true,
      payments: paymentHistory
    });

  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({
      error: 'Failed to fetch payment history',
      message: 'Unable to retrieve payment information'
    });
  }
});

module.exports = router;