import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Register from "./components/Register";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserList from "./components/UserList";
import UserProfile from "./components/UserProfile";
import { AppBar, Toolbar, Typography, Container, Button, CircularProgress, Box, Grid } from "@mui/material";
import Logo from "./assets/task-flow-logo.png";

const App = () => {
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authContext) {
      setIsLoading(false);
    }
  }, [authContext]);

  return (
    <Router>
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
        {/* ✅ Header Section */}
        <AppBar position="static" sx={{ bgcolor: "#1E1E2F", p: 2 }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* ✅ Logo */}
            <Box display="flex" alignItems="center">
              <img 
                src={Logo} 
                alt="Logo" 
                style={{ 
                  height: "40px", 
                  marginRight: "10px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
                TaskFlow
              </Typography>
            </Box>

            {/* ✅ Logout Button */}
            {authContext?.token && (
              <Button color="error" variant="contained" onClick={authContext.logout}>
                Logout
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {/* ✅ Navigation Links Below the Header */}
        {authContext?.token && (
          <Box sx={{ textAlign: "center", py: 2, bgcolor: "#F7F7FA", boxShadow: 1 }}>
            <Button component={Link} to="/dashboard" sx={{ mx: 2 }}>
              Dashboard
            </Button>
            {authContext.isAdmin && (
              <Button component={Link} to="/users" sx={{ mx: 2 }}>
                Manage Users
              </Button>
            )}
            <Button component={Link} to="/profile" sx={{ mx: 2 }}>
              Profile
            </Button>
          </Box>
        )}

        {/* ✅ Main Content */}
        <Container maxWidth="md" sx={{ py: 4 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : !authContext?.token ? (
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              {authContext.isAdmin && <Route path="/users" element={<UserList />} />}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          )}
        </Container>
      </Box>
    </Router>
  );
};

export default App;
