import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import KanbanBoard from "../components/KanbanBoard"; 
import {
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Divider
} from "@mui/material";

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext)!;
  const [project, setProject] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [refreshUsers, setRefreshUsers] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchAssignedUsers();
    fetchAllUsers();
  }, [id, refreshUsers]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/${id}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setAssignedUsers([...response.data]);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching assigned users:", error);
    }
};

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser) {
      console.error("❌ No user selected!");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/projects/${id}/assign`,
        { user_id: selectedUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setRefreshUsers((prev) => !prev);
      fetchAssignedUsers();
      setSelectedUser("");
    } catch (error) {
      console.error("❌ Error assigning user:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API_URL}/api/projects/${id}`, project, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };
 

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {project ? (
        <>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Project Details
          </Typography>

          <Card sx={{ boxShadow: 3, borderRadius: 1, p: 2 }}>
            <CardContent>
              {editMode ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      variant="outlined"
                      value={project.title}
                      onChange={(e) => setProject({ ...project, title: e.target.value })}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={3}
                      value={project.description}
                      onChange={(e) => setProject({ ...project, description: e.target.value })}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={project.start_date}
                      onChange={(e) => setProject({ ...project, start_date: e.target.value })}
                      required
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={project.end_date}
                      onChange={(e) => setProject({ ...project, end_date: e.target.value })}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={project.status}
                        onChange={(e) => setProject({ ...project, status: e.target.value })}
                        required
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Assign User</InputLabel>
                      <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                        {allUsers.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.username}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleAssignUser}>
                      Assign User
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Typography variant="h5" fontWeight={500}>
                    {project.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                    {project.description}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight={600}>
                        📅 Start Date:
                      </Typography>
                      <Typography variant="body2">{project.start_date}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight={600}>
                        ⏳ End Date:
                      </Typography>
                      <Typography variant="body2">{project.end_date}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight={600}>
                        📌 Status:
                      </Typography>
                      <Typography variant="body2">{project.status}</Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>

            {user?.role === "admin" && (
                <CardActions sx={{ justifyContent: "flex-end" }}>
                    {editMode ? (
                    <>
                        <Button variant="contained" color="primary" onClick={handleUpdate}>
                        Save
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)}>
                        Cancel
                        </Button>
                    </>
                    ) : (
                    <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>
                        Edit
                    </Button>
                    )}
                </CardActions>
            )}
          </Card>

          <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" fontWeight={600}>Team</Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle1" fontWeight={600}>Project Manager</Typography>
            <List>
              {assignedUsers.filter((user) => user.role === "admin").map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemAvatar>
                    <Avatar src={user.avatar || "https://via.placeholder.com/50"} />
                  </ListItemAvatar>
                  <ListItemText primary={user.username} secondary={user.email} />
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>Devs</Typography>
            <List>
              {assignedUsers.filter((user) => user.role === "user" || user.role === "guest").map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemAvatar>
                    <Avatar src={user.avatar || "https://via.placeholder.com/50"} />
                  </ListItemAvatar>
                  <ListItemText primary={user.username} secondary={user.email} />
                </ListItem>
              ))}
            </List>
          </Paper>

          <KanbanBoard projectId={Number(id)} /> 
        </>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Container>
  );
};

export default ProjectDetails;
