import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Invoice from '../models/Invoice.js';

// @desc    Get admin dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPortfolios = await Portfolio.countDocuments();
    const totalInvoices = await Invoice.countDocuments();

    // Plan breakdown
    const freeCount = await User.countDocuments({ plan: 'free' });
    const monthlyCount = await User.countDocuments({ plan: 'pro_monthly' });
    const yearlyCount = await User.countDocuments({ plan: 'pro_yearly' });
    const lifetimeCount = await User.countDocuments({ plan: 'lifetime' });

    // Recent signups
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

    // Recent portfolios
    const recentPortfolios = await Portfolio.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPortfolios,
        totalInvoices,
        plans: {
          free: freeCount,
          pro_monthly: monthlyCount,
          pro_yearly: yearlyCount,
          lifetime: lifetimeCount,
        },
      },
      recentUsers,
      recentPortfolios,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user plan directly
// @route   PUT /api/admin/users/:id/plan
// @access  Private/Admin
export const updateUserPlan = async (req, res, next) => {
  const { plan } = req.body;

  try {
    if (!['free', 'pro_monthly', 'pro_yearly', 'lifetime'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.plan = plan;
    await user.save();

    res.json({ success: true, message: `User plan updated to ${plan} successfully`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete associated portfolios
    await Portfolio.deleteMany({ user: user._id });
    // Delete associated invoices
    await Invoice.deleteMany({ user: user._id });

    await user.deleteOne();
    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all portfolios
// @route   GET /api/admin/portfolios
// @access  Private/Admin
export const getAllPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: portfolios.length, portfolios });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle feature portfolio
// @route   PUT /api/admin/portfolios/:id/feature
// @access  Private/Admin
export const toggleFeaturePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Toggle custom template metadata
    portfolio.templateType = portfolio.templateType === 'featured' ? 'minimal' : 'featured';
    await portfolio.save();

    res.json({
      success: true,
      message: `Portfolio featured state updated!`,
      portfolio,
    });
  } catch (error) {
    next(error);
  }
};
