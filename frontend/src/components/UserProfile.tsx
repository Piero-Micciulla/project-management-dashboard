import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Paper, 
  CircularProgress, 
  Box, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  Divider,
  Button,
  AvatarGroup,
  Card,
  CardContent,
  Grid
} from "@mui/material";


interface AssignedUser {
  id: number;
  username: string;
  avatar: string | null;
}

interface Project {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  assigned_users?: AssignedUser[];
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
}

const UserProfile: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { user } = authContext || {};

  useEffect(() => {
    if (user) {
      fetchUserProjects();
      fetchUserTickets();
    }
  }, [user]);

  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/projects`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchUserTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/tickets/user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!authContext) {
    return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  }

  if (!user) {
    return <Typography align="center">Loading user data...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper 
        sx={{ 
          p: 4, 
          boxShadow: 3, 
          borderRadius: 1, 
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

        <Box sx={{ textAlign: "left", mt: 2, width: "100%" }}>
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

        <Divider sx={{ my: 3, width: "100%" }} />
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          Your Projects 
        </Typography>

        {projects.length > 0 ? (
          <List sx={{ width: "100%"}}>
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
                    {project.assigned_users.map((user: AssignedUser) => (
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

        <Divider sx={{ my: 3, width: "100%" }} />
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          Your Tickets
        </Typography>

        {loading ? (
          <CircularProgress sx={{ my: 2 }} />
        ) : tickets.length > 0 ? (
          <Grid container spacing={2}>
            {tickets.map((ticket) => (
              <Grid item xs={12} sm={4} key={ticket.id}> {/* 3 per row on medium+ screens */}
                <Card sx={{ maxWidth: 205 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {ticket.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {ticket.description}
                    </Typography>
                    <Chip
                      label={ticket.priority}
                      color={
                        ticket.priority === "High"
                          ? "error"
                          : ticket.priority === "Medium"
                          ? "warning"
                          : "default"
                      }
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">No tickets assigned.</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile;
