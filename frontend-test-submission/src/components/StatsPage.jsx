import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";

const API_URL = "/api/shorturls";

function StatsPage() {
  const [shortCode, setShortCode] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSearch = async () => {
    setError("");
    setStats(null);
    if (!shortCode.trim()) {
      setError("Please enter a short code.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${shortCode.trim()}/stats`);
      setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Stats not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box px={isMobile ? 1 : 0}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        URL Stats
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Enter a short code to view stats (clicks, geo, expiry).
      </Typography>
      <Grid container spacing={isMobile ? 1.5 : 3} alignItems="center">
        <Grid item xs={12} sm={8} md={6}>
          <TextField
            label="Short Code"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            fullWidth
            size={isMobile ? "medium" : "small"}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            fullWidth
            size={isMobile ? "medium" : "large"}>
            {loading ? <CircularProgress size={22} /> : "Get Stats"}
          </Button>
        </Grid>
      </Grid>
      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {stats && (
        <Box mt={3}>
          <Card variant="outlined" sx={{ boxShadow: isMobile ? 0 : 2 }}>
            <CardContent>
              <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                Stats for <b>{stats.shortCode}</b>
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <b>Original URL:</b> {stats.originalUrl}
                  </Typography>
                  <Typography variant="body2">
                    <b>Short URL:</b> {stats.shortUrl}
                  </Typography>
                  <Typography variant="body2">
                    <b>Created:</b> {new Date(stats.createdAt).toLocaleString()}{" "}
                    (UTC)
                  </Typography>
                  <Typography variant="body2">
                    <b>Expires:</b> {new Date(stats.expiresAt).toLocaleString()}{" "}
                    (UTC)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <b>Clicks:</b> {stats.clicks}
                  </Typography>
                  <Typography variant="body2">
                    <b>Last Click:</b>{" "}
                    {stats.lastClickedAt
                      ? new Date(stats.lastClickedAt).toLocaleString() +
                        " (UTC)"
                      : "Never"}
                  </Typography>
                  <Typography variant="body2">
                    <b>Geo (simulated):</b> {stats.geo || "-"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

export default StatsPage;
