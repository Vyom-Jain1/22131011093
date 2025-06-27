const express = require("express");
const router = express.Router();
const {
  createShortUrl,
  getUrlStats,
  getAllUrls,
  deleteShortUrl,
} = require("../controllers/urlController");

// @route   POST /api/shorturls
// @desc    Create a new short URL
// @access  Public
router.post("/", createShortUrl);

// @route   GET /api/shorturls
// @desc    Get all URLs with pagination
// @access  Public
router.get("/", getAllUrls);

// @route   GET /api/shorturls/:shortCode
// @desc    Get URL statistics by short code
// @access  Public
router.get("/:shortCode", getUrlStats);

// @route   DELETE /api/shorturls/:shortCode
// @desc    Delete a short URL
// @access  Public
router.delete("/:shortCode", deleteShortUrl);

module.exports = router;
