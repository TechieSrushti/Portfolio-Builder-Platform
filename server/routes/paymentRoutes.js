import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  simulateUpgrade,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook requires raw payload, so we handle it before express.json() in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.post('/checkout', protect, createCheckoutSession);
router.post('/simulate-upgrade', protect, simulateUpgrade);

export default router;
