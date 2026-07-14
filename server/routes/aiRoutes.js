import express from 'express';
import {
  generateBio,
  generateProjectDesc,
  suggestSkills,
  generateResumeSummary,
  generateHeadline,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/bio', protect, generateBio);
router.post('/project-desc', protect, generateProjectDesc);
router.post('/skills-suggestion', protect, suggestSkills);
router.post('/resume-summary', protect, generateResumeSummary);
router.post('/headline', protect, generateHeadline);

export default router;
