import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { NotificationContext } from "../context/NotificationContext";
import { 
  Container, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, Avatar, ListItemAvatar
} from "@mui/material";
import { useDrop } from "react-dnd";
import TicketCard from "./TicketCard";
import ProjectProgress from "./ProjectProgress";
import { AuthContext } from "../context/AuthContext"; 

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_user_id: number | null;
}

interface User {
  id: number;
  username: string;
  avatar?: string;
}

interface KanbanBoardProps {
  projectId: number;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { user } = useContext(AuthContext)!;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [open, setOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newTicket, setNewTicket] = useState({ 
    title: "", 
    description: "", 
    priority: "Medium", 
    assigned_user_id: "" 
  });
  const { notify } = useContext(NotificationContext)!;
  

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, [projectId]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/projects/${projectId}/tickets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/projects/${projectId}/users`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewTicket({ title: "", description: "", priority: "Medium", assigned_user_id: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim()) return notify("Title is required!", "error");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/tickets`,
        { 
          ...newTicket, 
          project_id: projectId, 
          status: "To Do", 
          assigned_user_id: newTicket.assigned_user_id || null 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
      handleClose();
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const groupedTickets: Record<string, Ticket[]> = {
    "To Do": tickets.filter((t) => t.status === "To Do"),
    "In Progress": tickets.filter((t) => t.status === "In Progress"),
    "Done": tickets.filter((t) => t.status === "Done"),
  };

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/tickets/${ticketId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const totalTickets = tickets.length;
  const todoCount = groupedTickets["To Do"].length;
  const inProgressCount = groupedTickets["In Progress"].length;
  const doneCount = groupedTickets["Done"].length;

  return (
    <Container sx={{ mt: 4, maxWidth: "900px", px: 0 }} style={{ paddingInline: 0}}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Tickets Board
      </Typography>

      {user?.role === "admin" && (
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpen}>
          + Create Ticket
        </Button>
      )}

      <Grid container spacing={3}>
        {Object.keys(groupedTickets).map((status) => (
          <KanbanColumn
            key={status}
            title={status}
            tickets={groupedTickets[status]}
            onDropTicket={updateTicketStatus}
            refreshTickets={fetchTickets}
          />
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            variant="outlined"
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={newTicket.priority} onChange={handleSelectChange}>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Assign User</InputLabel>
            <Select name="assigned_user_id" value={newTicket.assigned_user_id} onChange={handleSelectChange}>
              <MenuItem value="">None</MenuItem>
              {allUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <ListItemAvatar>
                    <Avatar src={user.avatar || "https://via.placeholder.com/50"} />
                  </ListItemAvatar>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleCreateTicket} variant="contained" color="primary">Create</Button>
        </DialogActions>
      </Dialog>

      <ProjectProgress
        totalTickets={totalTickets}
        todoCount={todoCount}
        inProgressCount={inProgressCount}
        doneCount={doneCount}
      />
    </Container>
  );
};

interface KanbanColumnProps {
    title: string;
    tickets: Ticket[];
    onDropTicket: (ticketId: number, newStatus: string) => void;
    refreshTickets: () => Promise<void>;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, tickets, onDropTicket, refreshTickets }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TICKET",
    drop: (ticket: Ticket) => onDropTicket(ticket.id, title),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <Grid item xs={4} ref={drop}>
      <Paper sx={{ p: 2, backgroundColor: isOver ? "#f0f0f0" : "#fff" }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} refreshTickets={refreshTickets} />
        ))}
      </Paper>
    </Grid>
  );
};

export default KanbanBoard;
