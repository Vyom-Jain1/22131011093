const Url = require("../models/Url");
const { appLogger } = require("../middleware/logger");
const {
  generateShortCode,
  isProbablyUrl,
  isValidShortCode,
  isShortCodeAvailable,
  getExpiry,
  formatClick,
  sanitizeUrl,
} = require("../utils/shortCodeGenerator");

// @desc    Create a new short URL
// @route   POST /api/shorturls
// @access  Public
const createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl, customShortCode, validityMinutes = 30 } = req.body;
    if (!originalUrl)
      return res
        .status(400)
        .json({ error: "URL required", timestamp: new Date().toISOString() });
    const url = sanitizeUrl(originalUrl);
    if (!isProbablyUrl(url))
      return res
        .status(400)
        .json({ error: "Invalid URL", timestamp: new Date().toISOString() });

    let shortCode = customShortCode;
    if (shortCode) {
      if (!isValidShortCode(shortCode))
        return res
          .status(400)
          .json({
            error: "Bad shortcode",
            timestamp: new Date().toISOString(),
          });
      if (!(await isShortCodeAvailable(shortCode)))
        return res
          .status(409)
          .json({
            error: "Shortcode taken",
            timestamp: new Date().toISOString(),
          });
    } else {
      shortCode = await generateShortCode();
    }

    const expiresAt = getExpiry(validityMinutes);
    const newUrl = await Url.create({
      originalUrl: url,
      shortCode,
      expiresAt,
      createdBy: req.ip || "anon",
    });
    appLogger.info("Short URL created", { shortCode, url });
    res.status(201).json({
      data: {
        shortCode: newUrl.shortCode,
        shortUrl: newUrl.shortUrl,
        originalUrl: newUrl.originalUrl,
        createdAt: newUrl.createdAt,
        expiresAt: newUrl.expiresAt,
        timeRemaining: newUrl.timeRemaining,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // This is a quick catch-all, could be more granular
    appLogger.error("Create short URL failed", e);
    next(e);
  }
};

// @desc    Get URL statistics by short code
// @route   GET /api/shorturls/:shortCode
// @access  Public
const getUrlStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    if (!shortCode)
      return res
        .status(400)
        .json({
          error: "Shortcode required",
          timestamp: new Date().toISOString(),
        });
    const url = await Url.findOne({ shortCode });
    if (!url)
      return res
        .status(404)
        .json({ error: "Not found", timestamp: new Date().toISOString() });
    if (url.isExpired)
      return res
        .status(410)
        .json({ error: "Expired", timestamp: new Date().toISOString() });
    res.status(200).json({
      data: {
        shortCode: url.shortCode,
        shortUrl: url.shortUrl,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        timeRemaining: url.timeRemaining,
        isActive: url.isActive,
        totalClicks: url.totalClicks,
        clickStats: {
          total: url.totalClicks,
          recent: url.clicks.slice(-10).map((click) => ({
            timestamp: click.timestamp,
            referrer: click.referrer,
            location: click.location,
            userAgent: click.userAgent.slice(0, 50),
          })),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    appLogger.error("Get stats failed", e);
    next(e);
  }
};

// @desc    Get all URLs with pagination
// @route   GET /api/shorturls
// @access  Public
const getAllUrls = async (req, res, next) => {
  try {
    const urls = await Url.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("-clicks");
    res.status(200).json({
      data: urls.map((url) => ({
        shortCode: url.shortCode,
        shortUrl: url.shortUrl,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        timeRemaining: url.timeRemaining,
        isActive: url.isActive,
        totalClicks: url.totalClicks,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    appLogger.error("Get all URLs failed", e);
    next(e);
  }
};

// @desc    Delete a short URL
// @route   DELETE /api/shorturls/:shortCode
// @access  Public
const deleteShortUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });
    if (!url)
      return res
        .status(404)
        .json({ error: "Not found", timestamp: new Date().toISOString() });
    await Url.findByIdAndDelete(url._id);
    appLogger.info("Short URL deleted", { shortCode });
    res
      .status(200)
      .json({
        message: "Deleted",
        data: { shortCode },
        timestamp: new Date().toISOString(),
      });
  } catch (e) {
    appLogger.error("Delete short URL failed", e);
    next(e);
  }
};

module.exports = {
  createShortUrl,
  getUrlStats,
  getAllUrls,
  deleteShortUrl,
};
