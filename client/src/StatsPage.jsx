import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";

const API_URL = "/api/shorturls";

function StatsPage() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    axios
      .get(API_URL)
      .then((res) => {
        if (!ignore) {
          setUrls(res.data.data || []);
          setError("");
        }
      })
      .catch((err) => {
        setError(
          err.response?.data?.error || "Could not fetch stats. Try again later."
        );
      })
      .finally(() => setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Stats
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        All your shortened URLs and their analytics. Click a row for details.
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      ) : urls.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          No URLs found. Shorten a URL to see stats here.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {urls.map((url) => (
            <Grid item xs={12} key={url.shortCode}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    width="100%">
                    <Typography
                      variant="subtitle1"
                      sx={{ flexGrow: 1, wordBreak: "break-all" }}>
                      {url.shortUrl}
                    </Typography>
                    <Tooltip title="Copy short URL">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(url.shortUrl)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {copied === url.shortUrl && (
                      <Chip label="Copied!" color="success" size="small" />
                    )}
                    <Chip
                      label={url.isActive ? "Active" : "Inactive"}
                      color={url.isActive ? "primary" : "default"}
                      size="small"
                    />
                    <Chip
                      label={`Clicks: ${url.totalClicks}`}
                      color={url.totalClicks > 0 ? "secondary" : "default"}
                      size="small"
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="body2" gutterBottom>
                        <b>Original URL:</b> {url.originalUrl}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <b>Created:</b>{" "}
                        {new Date(url.createdAt).toLocaleString()} (UTC)
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <b>Expires:</b>{" "}
                        {new Date(url.expiresAt).toLocaleString()} (UTC)
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <b>Status:</b> {url.isActive ? "Active" : "Inactive"}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <b>Total Clicks:</b> {url.totalClicks}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Typography variant="subtitle2" gutterBottom>
                    Click History
                  </Typography>
                  <ClickHistory shortCode={url.shortCode} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function ClickHistory({ shortCode }) {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    axios
      .get(`/api/shorturls/${shortCode}`)
      .then((res) => {
        if (!ignore) {
          setClicks(res.data.data.clickStats.recent || []);
          setError("");
        }
      })
      .catch((err) => {
        setError("Could not load click history.");
      })
      .finally(() => setLoading(false));
    return () => {
      ignore = true;
    };
  }, [shortCode]);

  if (loading)
    return (
      <Box display="flex" alignItems="center" gap={1} mt={1}>
        <CircularProgress size={18} />
        <Typography variant="caption">Loading click history...</Typography>
      </Box>
    );
  if (error)
    return (
      <Alert severity="warning" sx={{ mt: 1 }}>
        {error}
      </Alert>
    );
  if (!clicks.length)
    return (
      <Typography variant="body2" color="text.secondary">
        No clicks yet.
      </Typography>
    );
  return (
    <Box mt={1}>
      {clicks.map((click, idx) => (
        <Card key={idx} variant="outlined" sx={{ mb: 1, p: 1 }}>
          <Typography variant="caption">
            <b>Time:</b> {new Date(click.timestamp).toLocaleString()} (UTC)
          </Typography>
          <Typography variant="caption" sx={{ ml: 2 }}>
            <b>Referrer:</b> {click.referrer}
          </Typography>
          <Typography variant="caption" sx={{ ml: 2 }}>
            <b>Location:</b> {click.location.city}, {click.location.country}
          </Typography>
          <Typography variant="caption" sx={{ ml: 2 }}>
            <b>User Agent:</b> {click.userAgent}
          </Typography>
        </Card>
      ))}
    </Box>
  );
}

export default StatsPage;
