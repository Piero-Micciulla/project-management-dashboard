import React, { useState, useEffect, useContext } from "react";
import { api } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardHeader, Typography, Button, Grid, List,
  ListItem, ListItemText, Paper, Avatar, ListItemAvatar, Chip,
  AvatarGroup
} from "@mui/material";

interface Project {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  assigned_users?: { id: number; username: string; avatar: string }[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const usersResponse = await api.get("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTotalUsers(usersResponse.data.length);
        setRecentUsers(usersResponse.data.slice(-5));

        const projectsResponse = await api.get("/api/projects/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(projectsResponse.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  if (user?.role !== "admin")
    return (
      <Typography color="error" align="center" variant="h6" component="div">
        🚫 Access Denied
      </Typography>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom component="div">
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 1 }}>
            <CardHeader title="Total Users" />
            <CardContent>
              <Typography variant="h5" color="primary" component="div">
                {totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" component="div">Recent Users</Typography>
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
                primary={
                  <Typography variant="body1" component="span">
                    {u.username} ({u.role})
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" component="span">
                    {u.email}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" component="div">Your projects</Typography>
        {projects.length > 0 ? (
          <List>
            {projects.map((project) => (
              <ListItem key={project.id} divider alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="h6" color="primary" component="div">
                      {project.title}
                    </Typography>
                  }
                  secondary={
                    <div>
                      <Typography variant="body2" component="div" color="textSecondary">
                        {project.description}
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ py: 1 }}>
                        📅 <strong>Start Date:</strong> {project.start_date}
                      </Typography>
                      <Typography variant="body2" component="div">
                        ⏳ <strong>End Date:</strong> {project.end_date}
                      </Typography>
                      <Chip
                        label={project.status}
                        color={
                          project.status === "Pending"
                            ? "warning"
                            : project.status === "In Progress"
                            ? "primary"
                            : "success"
                        }
                        sx={{ mt: 1 }}
                      />
                    </div>
                  }
                />

                {project.assigned_users && project.assigned_users.length > 0 && (
                  <AvatarGroup max={4} sx={{ ml: 2 }}>
                    {project.assigned_users.map((user) => (
                      <Avatar
                        key={user.id}
                        src={user.avatar || "https://via.placeholder.com/50"}
                        alt={user.username}
                        sx={{ width: 40, height: 40 }}
                      />
                    ))}
                  </AvatarGroup>
                )}

                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  View
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary" component="div">
            No projects assigned.
          </Typography>
        )}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/users")}
        sx={{ mt: 3 }}
      >
        Manage Users
      </Button>
    </div>
  );
};

export default AdminDashboard;
