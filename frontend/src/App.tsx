import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { DndProvider } from "react-dnd";  
import { HTML5Backend } from "react-dnd-html5-backend"; 
import { AuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext"; 
import Register from "./components/Register";
import ProjectList from "./components/ProjectList";
import ProjectDetails from "./components/ProjectDetails";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard"; 
import UserList from "./components/UserList";
import UserProfile from "./components/UserProfile";
import { AppBar, Toolbar, Typography, Container, Button, CircularProgress, Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles"; 
import CssBaseline from "@mui/material/CssBaseline"; 
import Logo from "./assets/task-flow-logo.png";

const theme = createTheme({
  palette: {
    mode: "light", 
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const App = () => {
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authContext) {
      setIsLoading(false);
    }
  }, [authContext]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
              <AppBar position="static" sx={{ bgcolor: "#1976d2", p: 2 }}>
                <div style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "900px", marginInline: "auto" }}>
                  <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
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

                    {authContext?.token && (
                      <Button color="error" variant="contained" onClick={authContext.logout}>
                        Logout
                      </Button>
                    )}
                  </Toolbar>
                </div>
              </AppBar>

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
                  <Button component={Link} to="/projects" sx={{ mx: 2 }}>
                    Projects
                  </Button>
                </Box>
              )}

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
                    <Route path="/dashboard" element={authContext.isAdmin ? <AdminDashboard /> : <UserDashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/projects" element={<ProjectList />} />
                    <Route path="/projects/:id" element={<ProjectDetails />} />
                    {authContext.isAdmin && <Route path="/users" element={<UserList />} />}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                )}
              </Container>
            </Box>
          </Router>
        </DndProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
