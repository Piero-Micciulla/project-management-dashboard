// src/components/UserProfile.tsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  Container, 
  Typography, 
  Paper, 
  CircularProgress, 
  Box, 
  Avatar 
} from "@mui/material";

const UserProfile: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  }

  const { user } = authContext;

  if (!user) {
    return <Typography align="center">Loading user data...</Typography>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper 
        sx={{ 
          p: 4, 
          boxShadow: 3, 
          borderRadius: 2, 
          textAlign: "center", 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center" 
        }}
      >
        <Avatar 
          src={user.avatar || "/default-avatar.png"} 
          alt="User Avatar" 
          sx={{ width: 100, height: 100, mb: 2 }}
        />

        <Typography variant="h4" gutterBottom>
          User Profile
        </Typography>

        <Box sx={{ textAlign: "left", mt: 2 }}>
          <Typography variant="body1">
            <strong>Username:</strong> {user.username}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body1">
            <strong>Role:</strong> {user.role}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile;
