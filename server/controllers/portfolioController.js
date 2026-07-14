import Portfolio from '../models/Portfolio.js';
import Analytics from '../models/Analytics.js';
import User from '../models/User.js';
import { getInitialSections, getTemplateColors } from '../utils/templates.js';

// Helper to log analytics views
const logAnalyticsView = async (portfolioId, req) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const country = req.headers['cf-ipcountry'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || 'Direct';

    let source = 'Direct';
    if (referrer && referrer !== 'Direct') {
      try {
        const url = new URL(referrer);
        source = url.hostname.replace('www.', '');
      } catch (err) {
        source = referrer;
      }
    }

    let device = 'Desktop';
    if (/tablet|ipad/i.test(userAgent)) {
      device = 'Tablet';
    } else if (/mobile|iphone|android/i.test(userAgent)) {
      device = 'Mobile';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyLog = await Analytics.findOne({ portfolio: portfolioId, date: today });
    if (!dailyLog) {
      dailyLog = new Analytics({
        portfolio: portfolioId,
        date: today,
        views: 0,
        uniqueIPs: [],
        countries: [],
        sources: [],
        devices: [],
      });
    }

    dailyLog.views += 1;

    // Check if unique IP visitor
    if (!dailyLog.uniqueIPs.includes(ip)) {
      dailyLog.uniqueIPs.push(ip);
    }

    // Helper to increment subschema map values
    const incrementMetric = (arr, metricName) => {
      const item = arr.find((x) => x.name.toLowerCase() === metricName.toLowerCase());
      if (item) {
        item.value += 1;
      } else {
        arr.push({ name: metricName, value: 1 });
      }
    };

    incrementMetric(dailyLog.countries, country);
    incrementMetric(dailyLog.sources, source);
    incrementMetric(dailyLog.devices, device);

    await dailyLog.save();
  } catch (error) {
    console.error('Analytics Logging Error:', error);
  }
};

// @desc    Create a new portfolio
// @route   POST /api/portfolios
// @access  Private
export const createPortfolio = async (req, res, next) => {
  const { title, templateType, username } = req.body;

  try {
    // Generate clean username slug
    const cleanUsername = (username || title || 'my-portfolio')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Check for duplicate username
    const usernameExists = await Portfolio.findOne({ username: cleanUsername });
    let finalUsername = cleanUsername;
    if (usernameExists) {
      finalUsername = `${cleanUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const initialSections = getInitialSections(templateType || 'minimal', req.user.name);
    const templateColors = getTemplateColors(templateType || 'minimal');

    const portfolio = await Portfolio.create({
      user: req.user._id,
      title: title || 'My Portfolio',
      username: finalUsername,
      templateType: templateType || 'minimal',
      colors: templateColors,
      sections: initialSections,
      seo: {
        metaTitle: `${title || 'My Portfolio'} | Created via Portfolio Builder`,
        metaDescription: `Check out my online portfolio. Created using Portfolio Builder Platform.`,
        keywords: 'portfolio, resume, CV, developer, designer, freelance',
      },
    });

    res.status(201).json({ success: true, portfolio });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's portfolios
// @route   GET /api/portfolios
// @access  Private
export const getPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: portfolios.length, portfolios });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single portfolio by ID
// @route   GET /api/portfolios/:id
// @access  Private
export const getPortfolioById = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    res.json({ success: true, portfolio });
  } catch (error) {
    next(error);
  }
};

// @desc    Update portfolio content & settings
// @route   PUT /api/portfolios/:id
// @access  Private
export const updatePortfolio = async (req, res, next) => {
  const { title, templateType, theme, colors, font, sections, customDomain, password, seo } = req.body;

  try {
    let portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    // Version management: Push current state to versions history before updating
    const versionNumber = portfolio.currentVersionNumber;
    const previousState = {
      versionNumber,
      title: portfolio.title,
      sections: portfolio.sections,
      theme: portfolio.theme,
      colors: portfolio.colors,
      updatedAt: new Date(),
    };

    // Maintain a history of up to 5 versions
    const updatedVersions = [previousState, ...portfolio.versions].slice(0, 5);

    // Apply updates
    portfolio.title = title || portfolio.title;
    portfolio.templateType = templateType || portfolio.templateType;
    portfolio.theme = theme || portfolio.theme;
    portfolio.colors = colors || portfolio.colors;
    portfolio.font = font || portfolio.font;
    portfolio.sections = sections || portfolio.sections;
    portfolio.customDomain = customDomain !== undefined ? customDomain : portfolio.customDomain;
    portfolio.password = password !== undefined ? password : portfolio.password;
    portfolio.seo = seo || portfolio.seo;
    portfolio.versions = updatedVersions;
    portfolio.currentVersionNumber = versionNumber + 1;

    const updatedPortfolio = await portfolio.save();
    res.json({ success: true, message: 'Portfolio updated successfully', portfolio: updatedPortfolio });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete portfolio
// @route   DELETE /api/portfolios/:id
// @access  Private
export const deletePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    await portfolio.deleteOne();
    res.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish/Unpublish portfolio
// @route   PUT /api/portfolios/:id/publish
// @access  Private
export const publishPortfolio = async (req, res, next) => {
  const { isPublished } = req.body;

  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    portfolio.isPublished = isPublished;
    await portfolio.save();

    res.json({ success: true, message: isPublished ? 'Portfolio published!' : 'Portfolio unpublished.', portfolio });
  } catch (error) {
    next(error);
  }
};

// @desc    Get published portfolio by username or domain (Public)
// @route   GET /api/portfolios/p/:username
// @access  Public
export const getPublishedPortfolio = async (req, res, next) => {
  const { username } = req.params;
  const { password } = req.query;

  try {
    const portfolio = await Portfolio.findOne({
      $or: [{ username: username.toLowerCase() }, { customDomain: username.toLowerCase() }],
      isPublished: true,
    }).populate('user', 'name email plan');

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found or is currently private.' });
    }

    // Password Protection validation
    if (portfolio.password && portfolio.password !== '') {
      if (!password || portfolio.password !== password) {
        return res.status(403).json({
          success: false,
          isProtected: true,
          message: 'This portfolio is password protected.',
        });
      }
    }

    // Track analytics visit asynchronously
    logAnalyticsView(portfolio._id, req);

    res.json({ success: true, portfolio });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a portfolio (Public / Authenticated)
// @route   POST /api/portfolios/:id/like
// @access  Private
export const likePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const likeIdx = portfolio.likes.indexOf(req.user._id);

    if (likeIdx > -1) {
      // Unlike
      portfolio.likes.splice(likeIdx, 1);
      await portfolio.save();
      res.json({ success: true, liked: false, likesCount: portfolio.likes.length });
    } else {
      // Like
      portfolio.likes.push(req.user._id);
      await portfolio.save();
      res.json({ success: true, liked: true, likesCount: portfolio.likes.length });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to portfolio
// @route   POST /api/portfolios/:id/comment
// @access  Private
export const addComment = async (req, res, next) => {
  const { text } = req.body;

  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    const newComment = {
      user: req.user._id,
      userName: req.user.name,
      text,
    };

    portfolio.comments.push(newComment);
    await portfolio.save();

    res.json({ success: true, comments: portfolio.comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore previous version
// @route   POST /api/portfolios/:id/restore/:versionNumber
// @access  Private
export const restoreVersion = async (req, res, next) => {
  const { versionNumber } = req.params;

  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    // Check ownership
    if (portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    const targetVersion = portfolio.versions.find((v) => v.versionNumber === parseInt(versionNumber));

    if (!targetVersion) {
      return res.status(404).json({ success: false, message: 'Version not found in history' });
    }

    // Save previous state to history
    const oldVersionNumber = portfolio.currentVersionNumber;
    const oldState = {
      versionNumber: oldVersionNumber,
      title: portfolio.title,
      sections: portfolio.sections,
      theme: portfolio.theme,
      colors: portfolio.colors,
      updatedAt: new Date(),
    };

    // Restore target values
    portfolio.title = targetVersion.title || portfolio.title;
    portfolio.sections = targetVersion.sections;
    portfolio.theme = targetVersion.theme;
    portfolio.colors = targetVersion.colors;
    portfolio.currentVersionNumber = oldVersionNumber + 1;
    portfolio.versions = [oldState, ...portfolio.versions].slice(0, 5);

    await portfolio.save();
    res.json({ success: true, message: 'Portfolio restored to version successfully', portfolio });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published portfolios (Public Gallery)
// @route   GET /api/portfolios/gallery
// @access  Public
export const getGallery = async (req, res, next) => {
  const { search, category, sort } = req.query;

  try {
    let query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.templateType = category;
    }

    let queryExec = Portfolio.find(query).populate('user', 'name plan');

    if (sort === 'popular') {
      // Sort by likes array size descending
      queryExec = queryExec.sort({ 'likes.length': -1 });
    } else {
      // Default to recently published
      queryExec = queryExec.sort({ updatedAt: -1 });
    }

    const portfolios = await queryExec;
    res.json({ success: true, count: portfolios.length, portfolios });
  } catch (error) {
    next(error);
  }
};
