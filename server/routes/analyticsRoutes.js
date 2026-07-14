import express from 'express';
import { getPortfolioAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:portfolioId', protect, getPortfolioAnalytics);

export default router;
