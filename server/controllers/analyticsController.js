import Analytics from '../models/Analytics.js';
import Portfolio from '../models/Portfolio.js';

// @desc    Get analytics for a specific portfolio
// @route   GET /api/analytics/:portfolioId
// @access  Private
export const getPortfolioAnalytics = async (req, res, next) => {
  const { portfolioId } = req.params;

  try {
    const portfolio = await Portfolio.findById(portfolioId);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Verify ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Get analytics logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await Analytics.find({
      portfolio: portfolioId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 });

    // Aggregate values
    let totalViews = 0;
    const ipSet = new Set();
    const countryMap = {};
    const sourceMap = {};
    const deviceMap = {};
    const chartData = [];

    logs.forEach((log) => {
      totalViews += log.views;
      log.uniqueIPs.forEach((ip) => ipSet.add(ip));

      // Aggregate Country Map
      log.countries.forEach((c) => {
        countryMap[c.name] = (countryMap[c.name] || 0) + c.value;
      });

      // Aggregate Source Map
      log.sources.forEach((s) => {
        sourceMap[s.name] = (sourceMap[s.name] || 0) + s.value;
      });

      // Aggregate Device Map
      log.devices.forEach((d) => {
        deviceMap[d.name] = (deviceMap[d.name] || 0) + d.value;
      });

      // Add view points for line graphs
      chartData.push({
        date: log.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        views: log.views,
        visitors: log.uniqueIPs.length,
      });
    });

    // Formatting outputs as standard arrays for high-charts/custom tables
    const countries = Object.keys(countryMap).map((k) => ({ name: k, value: countryMap[k] })).sort((a, b) => b.value - a.value);
    const sources = Object.keys(sourceMap).map((k) => ({ name: k, value: sourceMap[k] })).sort((a, b) => b.value - a.value);
    const devices = Object.keys(deviceMap).map((k) => ({ name: k, value: deviceMap[k] })).sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      summary: {
        totalViews,
        totalUniqueVisitors: ipSet.size,
      },
      countries,
      sources,
      devices,
      chartData,
    });
  } catch (error) {
    next(error);
  }
};
