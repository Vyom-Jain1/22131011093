const { nanoid } = require("nanoid");
const Url = require("../models/Url");

// Generates a unique short code, tries a few times before giving up
const generateShortCode = async (length = 8) => {
  for (let i = 0; i < 7; i++) {
    // 7 attempts is enough
    const code = nanoid(length);
    if (!(await Url.findOne({ shortCode: code }))) return code;
  }
  // TODO: If this ever fails, consider using a longer code or alerting devs
  throw new Error("Could not generate a unique short code. Try again.");
};

// Quick URL format check
const isProbablyUrl = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// Short code rules: 3-20 chars, alphanum, dash, underscore
const isValidShortCode = (code) => /^[a-zA-Z0-9_-]{3,20}$/.test(code);

const isShortCodeAvailable = async (code) => {
  if (!isValidShortCode(code)) return false;
  return !(await Url.findOne({ shortCode: code }));
};

const getExpiry = (minutes = 30) => new Date(Date.now() + minutes * 60000);

// Simulate location (stub)
const fakeLocation = (ip) => {
  const places = [
    { country: "US", city: "NYC" },
    { country: "UK", city: "London" },
    { country: "IN", city: "Mumbai" },
    { country: "DE", city: "Berlin" },
    { country: "JP", city: "Tokyo" },
    { country: "AU", city: "Sydney" },
  ];
  let hash = 0;
  for (let i = 0; i < ip.length; i++)
    hash = ip.charCodeAt(i) + ((hash << 5) - hash);
  return places[Math.abs(hash) % places.length];
};

const formatClick = (req) => ({
  timestamp: new Date(),
  referrer: req.get("Referer") || "direct",
  userAgent: (req.get("User-Agent") || "").slice(0, 200),
  ipAddress: req.ip || "unknown",
  location: fakeLocation(req.ip || "0.0.0.0"),
});

const sanitizeUrl = (url) => {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
};

module.exports = {
  generateShortCode,
  isProbablyUrl,
  isValidShortCode,
  isShortCodeAvailable,
  getExpiry,
  fakeLocation,
  formatClick,
  sanitizeUrl,
};
