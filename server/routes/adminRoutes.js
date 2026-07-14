import express from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  updateUserPlan,
  deleteUser,
  getAllPortfolios,
  toggleFeaturePortfolio,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Apply protect & admin middlewares to all admin routes
router.use(protect);
router.use(admin);

router.get('/dashboard', getAdminDashboard);

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.put('/users/:id/plan', updateUserPlan);

router.get('/portfolios', getAllPortfolios);
router.put('/portfolios/:id/feature', toggleFeaturePortfolio);

export default router;
