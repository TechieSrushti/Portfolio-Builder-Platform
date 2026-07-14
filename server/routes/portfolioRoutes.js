import express from 'express';
import {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
  publishPortfolio,
  getPublishedPortfolio,
  likePortfolio,
  addComment,
  restoreVersion,
  getGallery,
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (Must declare specific sub-endpoints BEFORE wildcard :id matches)
router.get('/gallery', getGallery);
router.get('/p/:username', getPublishedPortfolio);

// Protected routes
router.route('/')
  .post(protect, createPortfolio)
  .get(protect, getPortfolios);

router.route('/:id')
  .get(protect, getPortfolioById)
  .put(protect, updatePortfolio)
  .delete(protect, deletePortfolio);

router.put('/:id/publish', protect, publishPortfolio);
router.post('/:id/like', protect, likePortfolio);
router.post('/:id/comment', protect, addComment);
router.post('/:id/restore/:versionNumber', protect, restoreVersion);

export default router;
