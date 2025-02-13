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

const UserDashboard: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        const projectsResponse = await api.get("/api/projects/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(projectsResponse.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    fetchUserProjects();
  }, []);

  if (!user)
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

        <Paper elevation={3} sx={{ mt: 3, p: 3, borderRadius: 3, boxShadow: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Your Projects
            </Typography>
            {projects.length > 0 ? (
            <List>
                {projects.map((project) => (
                <ListItem key={project.id} divider sx={{ py: 2 }}>
                    <ListItemText
                    primary={
                        <Typography variant="h6" color="primary" component="div">
                        {project.title}
                        </Typography>
                    }
                    secondary={
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "10px" }}>
                            <Typography variant="body2" component="div" color="textSecondary" sx={{ mb: 2 }}>
                                {project.description}
                            </Typography>

                            <Typography variant="body2" component="div"  sx={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: { xs: "5px", md: "10px" }}}>
                                📅 <strong>Start Date:</strong>
                                <span style={{ fontWeight: 500 }}>{project.start_date}</span>
                            </Typography>

                            <Typography variant="body2" component="div" sx={{ display: "flex", alignItems: "center", gap: "6px", paddingTop: "5px" }}>
                                ⏳ <strong>End Date:</strong>
                                <span style={{ fontWeight: 500 }}>{project.end_date}</span>
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
                    <AvatarGroup max={4} sx={{ ml: 3 }}>
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
                    sx={{ ml: 3, px: 3, py: 1, borderRadius: 2 }}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    >
                    View
                    </Button>
                </ListItem>
                ))}
            </List>
            ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                No projects assigned.
            </Typography>
            )}
        </Paper>
        </div>
  );
};

export default UserDashboard;
