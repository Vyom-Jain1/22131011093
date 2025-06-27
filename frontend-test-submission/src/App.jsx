import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ShortenPage from "./ShortenPage";
import StatsPage from "./components/StatsPage";

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Router>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant={isMobile ? "h6" : "h5"} sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Shorten
          </Button>
          <Button color="inherit" component={Link} to="/stats">
            Stats
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          background: theme.palette.background.default,
          minHeight: "100vh",
          py: isMobile ? 2 : 4,
        }}>
        <Container maxWidth="md">
          <Routes>
            <Route path="/" element={<ShortenPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
