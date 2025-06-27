const Url = require("../models/Url");
const { appLogger } = require("../middleware/logger");
const { formatClick } = require("../utils/shortCodeGenerator");

// @desc    Redirect to original URL
// @route   GET /:shortCode
// @access  Public
const redirectToOriginal = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({
        success: false,
        error: "Short code is required",
        timestamp: new Date().toISOString(),
      });
    }

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: "Short URL not found",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if URL is expired
    if (url.isExpired) {
      return res.status(410).json({
        success: false,
        error: "Short URL has expired",
        data: {
          shortCode: url.shortCode,
          originalUrl: url.originalUrl,
          createdAt: url.createdAt,
          expiredAt: url.expiresAt,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Check if URL is active
    if (!url.isActive) {
      return res.status(410).json({
        success: false,
        error: "Short URL is no longer active",
        timestamp: new Date().toISOString(),
      });
    }

    // Format click data
    const clickData = formatClick(req);

    // Add click to URL document
    await url.addClick(clickData);

    appLogger.info("URL redirect successful", {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      totalClicks: url.totalClicks + 1,
    });

    // Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    appLogger.error("Error during URL redirect", error);
    next(error);
  }
};

// @desc    Get URL info without redirecting
// @route   GET /:shortCode/info
// @access  Public
const getUrlInfo = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({
        success: false,
        error: "Short code is required",
        timestamp: new Date().toISOString(),
      });
    }

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: "Short URL not found",
        timestamp: new Date().toISOString(),
      });
    }

    appLogger.info("URL info retrieved", {
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
    });

    res.status(200).json({
      success: true,
      data: {
        shortCode: url.shortCode,
        shortUrl: url.shortUrl,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        timeRemaining: url.timeRemaining,
        isActive: url.isActive,
        isExpired: url.isExpired,
        totalClicks: url.totalClicks,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    appLogger.error("Error retrieving URL info", error);
    next(error);
  }
};

module.exports = {
  redirectToOriginal,
  getUrlInfo,
};
