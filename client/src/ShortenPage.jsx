import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Tooltip,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";

const MAX_URLS = 5;
const API_URL = "/api/shorturls";

const initialForm = {
  originalUrl: "",
  customShortCode: "",
  validityMinutes: 30,
};

function ShortenPage() {
  const [forms, setForms] = useState([
    { ...initialForm, error: {}, loading: false, result: null },
  ]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add a new form (up to MAX_URLS)
  const handleAddForm = () => {
    if (forms.length < MAX_URLS) {
      setForms([
        ...forms,
        { ...initialForm, error: {}, loading: false, result: null },
      ]);
    }
  };

  // Remove a form
  const handleRemoveForm = (idx) => {
    setForms(forms.filter((_, i) => i !== idx));
  };

  // Handle input change
  const handleChange = (idx, field, value) => {
    const updated = [...forms];
    updated[idx][field] = value;
    updated[idx].error = { ...updated[idx].error, [field]: undefined };
    setForms(updated);
  };

  // Validate a single form
  const validateForm = (form) => {
    const error = {};
    if (!form.originalUrl.trim()) {
      error.originalUrl = "Original URL is required";
    } else if (
      !/^https?:\/\//i.test(form.originalUrl.trim()) &&
      !/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(form.originalUrl.trim())
    ) {
      error.originalUrl = "Enter a valid URL (with or without http(s)://)";
    }
    if (
      form.customShortCode &&
      !/^[a-zA-Z0-9_-]{3,20}$/.test(form.customShortCode)
    ) {
      error.customShortCode =
        "3-20 chars: letters, numbers, hyphens, underscores";
    }
    if (
      form.validityMinutes &&
      (isNaN(form.validityMinutes) ||
        form.validityMinutes < 1 ||
        form.validityMinutes > 1440)
    ) {
      error.validityMinutes = "1-1440 minutes allowed";
    }
    return error;
  };

  // Handle submit for a single form
  const handleSubmit = async (idx) => {
    const form = forms[idx];
    const error = validateForm(form);
    if (Object.keys(error).length > 0) {
      setForms((prev) => {
        const updated = [...prev];
        updated[idx].error = error;
        return updated;
      });
      return;
    }
    setForms((prev) => {
      const updated = [...prev];
      updated[idx].loading = true;
      updated[idx].error = {};
      return updated;
    });
    try {
      const payload = {
        originalUrl: form.originalUrl.trim().startsWith("http")
          ? form.originalUrl.trim()
          : "https://" + form.originalUrl.trim(),
        validityMinutes: form.validityMinutes || 30,
      };
      if (form.customShortCode) payload.customShortCode = form.customShortCode;
      const res = await axios.post(API_URL, payload);
      setForms((prev) => {
        const updated = [...prev];
        updated[idx].result = res.data.data;
        updated[idx].loading = false;
        return updated;
      });
      setSnackbar({
        open: true,
        message: "Short URL created!",
        severity: "success",
      });
    } catch (err) {
      let msg = err.response?.data?.error || "Failed to shorten URL";
      setForms((prev) => {
        const updated = [...prev];
        updated[idx].loading = false;
        updated[idx].error = { submit: msg };
        return updated;
      });
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  // Copy to clipboard
  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setSnackbar({
      open: true,
      message: "Copied to clipboard!",
      severity: "info",
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shorten URLs
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        You can shorten up to {MAX_URLS} URLs at once. Optionally set expiry and
        custom code.
      </Typography>
      <Grid container spacing={3}>
        {forms.map((form, idx) => (
          <Grid item xs={12} key={idx}>
            <Card variant="outlined" sx={{ position: "relative" }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Original URL"
                      value={form.originalUrl}
                      onChange={(e) =>
                        handleChange(idx, "originalUrl", e.target.value)
                      }
                      error={!!form.error.originalUrl}
                      helperText={form.error.originalUrl}
                      fullWidth
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Validity (min)"
                      type="number"
                      value={form.validityMinutes}
                      onChange={(e) =>
                        handleChange(idx, "validityMinutes", e.target.value)
                      }
                      error={!!form.error.validityMinutes}
                      helperText={form.error.validityMinutes}
                      fullWidth
                      size="small"
                      inputProps={{ min: 1, max: 1440 }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Custom Shortcode"
                      value={form.customShortCode}
                      onChange={(e) =>
                        handleChange(idx, "customShortCode", e.target.value)
                      }
                      error={!!form.error.customShortCode}
                      helperText={form.error.customShortCode}
                      fullWidth
                      size="small"
                      placeholder="Optional"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSubmit(idx)}
                      disabled={form.loading}
                      fullWidth
                      sx={{ minWidth: 120 }}
                      size="large">
                      {form.loading ? (
                        <CircularProgress size={22} />
                      ) : (
                        "Shorten"
                      )}
                    </Button>
                  </Grid>
                </Grid>
                {form.error.submit && (
                  <Box mt={2}>
                    <Alert severity="error">{form.error.submit}</Alert>
                  </Box>
                )}
                {form.result && (
                  <Box mt={2}>
                    <Alert severity="success" icon={false}>
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-all" }}>
                          <b>Short URL:</b> {form.result.shortUrl}
                        </Typography>
                        <Tooltip title="Copy">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(form.result.shortUrl)}
                            sx={{ ml: 1 }}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Expires at:{" "}
                        {new Date(form.result.expiresAt).toLocaleString()} (UTC)
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </CardContent>
              {forms.length > 1 && (
                <Button
                  size="small"
                  color="secondary"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() => handleRemoveForm(idx)}>
                  Remove
                </Button>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={3}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddForm}
          disabled={forms.length >= MAX_URLS}>
          Add Another URL
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ShortenPage;
