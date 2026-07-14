import express from 'express';
import {
  getResume,
  updateResume,
  downloadResumePdf,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getResume)
  .put(protect, updateResume);

router.get('/pdf', protect, downloadResumePdf);

export default router;
