import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Chip, AvatarGroup, Avatar
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
  
const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useContext(AuthContext)!;
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "Pending",
  });  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleAddProject = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!newProject.title || !newProject.start_date || !newProject.end_date) {
        console.error("Missing required fields");
        return;
      }
  
      const formattedProject = {
        title: newProject.title,
        description: newProject.description || "",
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        status: newProject.status || "Pending",
      };
  
      await axios.post(`${process.env.REACT_APP_API_URL}/api/projects`, formattedProject, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      fetchProjects();
      setOpenDialog(false);
      setNewProject({ title: "", description: "", start_date: "", end_date: "", status: "Pending" });
    } catch (error: any) {
      console.error("Error adding project:", error.response?.data || error);
    }
  };  

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Projects</Typography>

      {user?.role === "admin" && (
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          + Add Project
        </Button>
      )}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>End Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Staff</strong></TableCell>
              <TableCell><strong>View</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
                <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.title}</TableCell>
                <TableCell>{project.start_date}</TableCell>
                <TableCell>{project.end_date}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                    <AvatarGroup max={4}>
                    {project.assigned_users?.map((user) => (
                        <Avatar
                        key={user.id}
                        src={user.avatar || "https://via.placeholder.com/50"}
                        alt={user.username}
                        sx={{ width: 30, height: 30 }}
                        />
                    ))}
                    </AvatarGroup>
                </TableCell>
                <TableCell>
                    <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    >
                    View
                    </Button>
                </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
            <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            required
            />

            <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />

            <TextField
            label="Start Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newProject.start_date}
            onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
            required
            />

            <TextField
            label="End Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newProject.end_date}
            onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
            required
            />

            <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
                value={newProject.status}
                onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                required
            >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
            </Select>
            </FormControl>
        </DialogContent>

        <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddProject} variant="contained" color="primary">
            Create
            </Button>
        </DialogActions>
        </Dialog>
    </Container>
  );
};

export default ProjectList;
