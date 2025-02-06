import React, { useState, useEffect, useContext } from "react";
import { api } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, Typography, Button, Grid, List, ListItem, ListItemText, Paper, Avatar, ListItemAvatar } from "@mui/material";

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTotalUsers(response.data.length);
        setRecentUsers(response.data.slice(-5)); // Show last 5 users
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  if (user?.role !== "admin") return <Typography color="error" align="center" variant="h6">🚫 Access Denied</Typography>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader title="Total Users" />
            <CardContent>
              <Typography variant="h5" color="primary">
                {totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} style={{ marginTop: "20px", padding: "15px" }}>
        <Typography variant="h6">Recent Users</Typography>
        <List>
          {recentUsers.map((u: any) => (
            <ListItem key={u.id} divider>
              <ListItemAvatar>
                <Avatar 
                  src={u.avatar || "https://via.placeholder.com/50"} 
                  alt={u.username}
                  sx={{ width: 40, height: 40 }}
                />
              </ListItemAvatar>
              <ListItemText 
                primary={`${u.username} (${u.role})`} 
                secondary={u.email} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/users")} 
        style={{ marginTop: "20px" }}
      >
        Go to Manage Users
      </Button>
    </div>
  );
};

export default AdminDashboard;
