const express = require("express");
const router = express.Router();
const {
  redirectToOriginal,
  getUrlInfo,
} = require("../controllers/redirectController");

// @route   GET /:shortCode
// @desc    Redirect to original URL
// @access  Public
router.get("/:shortCode", redirectToOriginal);

// @route   GET /:shortCode/info
// @desc    Get URL info without redirecting
// @access  Public
router.get("/:shortCode/info", getUrlInfo);

module.exports = router;
