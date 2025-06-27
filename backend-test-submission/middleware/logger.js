const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, "app.log");
const errorLogFile = path.join(logsDir, "error.log");

// Helper function to format timestamp
const formatTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to write to log file
const writeToLog = (filePath, message) => {
  const timestamp = formatTimestamp();
  const logEntry = `[${timestamp}] ${message}\n`;

  fs.appendFile(filePath, logEntry, (err) => {
    if (err) {
      // Fallback to console if file write fails
      console.error("Failed to write to log file:", err.message);
    }
  });
};

// Helper function to get client IP
const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    "unknown"
  );
};

// Helper function to get user agent
const getUserAgent = (req) => {
  return req.get("User-Agent") || "unknown";
};

// Helper function to get referrer
const getReferrer = (req) => {
  return req.get("Referer") || "direct";
};

// Helper function to extract token info from request
const getTokenInfo = (req) => {
  // Try headers first
  const token_type = req.headers["token_type"] || req.body?.token_type;
  const access_token = req.headers["access_token"] || req.body?.access_token;
  const expires_in = req.headers["expires_in"] || req.body?.expires_in;

  // If none present, return empty string
  if (!token_type && !access_token && !expires_in) return "";

  // Otherwise, return as JSON string
  return `| token_type: ${token_type || "-"} | access_token: ${
    access_token
      ? access_token.length > 20
        ? access_token.substring(0, 20) + "..."
        : access_token
      : "-"
  } | expires_in: ${expires_in || "-"}`;
};

// Main logging middleware
const logger = (req, res, next) => {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);
  const referrer = getReferrer(req);
  const tokenInfo = getTokenInfo(req);

  // Log request
  const requestLog = `REQUEST: ${req.method} ${
    req.originalUrl
  } | IP: ${clientIP} | UA: ${userAgent.substring(
    0,
    100
  )} | Referrer: ${referrer} ${tokenInfo}`;
  writeToLog(logFile, requestLog);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const statusCode = res.statusCode;

    // Log response
    const responseLog = `RESPONSE: ${req.method} ${req.originalUrl} | Status: ${statusCode} | Duration: ${duration}ms | IP: ${clientIP} ${tokenInfo}`;
    writeToLog(logFile, responseLog);

    // Log errors separately
    if (statusCode >= 400) {
      const errorLog = `ERROR: ${req.method} ${req.originalUrl} | Status: ${statusCode} | Duration: ${duration}ms | IP: ${clientIP} ${tokenInfo}`;
      writeToLog(errorLogFile, errorLog);
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Utility function for application logging
const appLogger = {
  info: (message, data = {}) => {
    const logMessage = `INFO: ${message} ${
      Object.keys(data).length ? JSON.stringify(data) : ""
    }`;
    writeToLog(logFile, logMessage);
  },

  error: (message, error = null) => {
    const errorDetails = error
      ? ` | Error: ${error.message} | Stack: ${error.stack}`
      : "";
    const logMessage = `ERROR: ${message}${errorDetails}`;
    writeToLog(errorLogFile, logMessage);
  },

  warn: (message, data = {}) => {
    const logMessage = `WARN: ${message} ${
      Object.keys(data).length ? JSON.stringify(data) : ""
    }`;
    writeToLog(logFile, logMessage);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === "development") {
      const logMessage = `DEBUG: ${message} ${
        Object.keys(data).length ? JSON.stringify(data) : ""
      }`;
      writeToLog(logFile, logMessage);
    }
  },
};

module.exports = logger;
module.exports.appLogger = appLogger;
