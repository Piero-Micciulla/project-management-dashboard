import React, { useState, useEffect, useContext } from "react";
import { useDrag } from "react-dnd";
import { 
  Card, CardContent, Typography, Chip, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, 
  InputLabel, Avatar, ListItemAvatar
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";  // ✅ Import Auth Context
import { NotificationContext } from "../context/NotificationContext";  // ✅ Import Notification Context

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

interface TicketCardProps {
  ticket: Ticket;
  refreshTickets: () => Promise<void>;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, refreshTickets }) => {
  const { user } = useContext(AuthContext)!; 
  const { notify } = useContext(NotificationContext)!;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TICKET",
    item: { id: ticket.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [open, setOpen] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);

  useEffect(() => {
    if (open) {
      fetchAllUsers();
    }
  }, [open]);

  useEffect(() => {
    if (ticket.assigned_user_id) {
      fetchAssignedUser(ticket.assigned_user_id);
    }
  }, [ticket.assigned_user_id]);

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

  const fetchAssignedUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedUser(response.data);
    } catch (error) {
      console.error("Error fetching assigned user:", error);
    }
  };

  const handleEdit = async () => {
    if (user?.role === "guest") {
      notify("Guests cannot edit tickets!", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/tickets/${ticket.id}`,
        { ...editedTicket },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpen(false);
      refreshTickets();
      notify("Ticket updated successfully!", "success");
    } catch (error) {
      console.error("Error updating ticket:", error);
      notify("Failed to update ticket.", "error");
    }
  };

  const handleDelete = async () => {
    if (user?.role === "guest") {
      notify("Guests cannot delete tickets!", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tickets/${ticket.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshTickets();
      notify("Ticket deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      notify("Failed to delete ticket.", "error");
    }
  };

  return (
    <>
      <Card ref={drag} sx={{ opacity: isDragging ? 0.5 : 1, mb: 2, p: 1, maxWidth: 250 }}>
        <CardContent>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}> 
            <Typography variant="h6" fontWeight={600} gutterBottom>
                {ticket.title}
            </Typography>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton 
                  color="primary" 
                  onClick={() => user?.role !== "guest" ? setOpen(true) : notify("Guests cannot edit tickets!", "warning")}
                >
                  <Edit />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={handleDelete}
                >
                  <Delete />
                </IconButton>
            </div>
          </div> 

          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {ticket.description}
          </Typography>

          <Chip
            label={ticket.priority}
            color={ticket.priority === "High" ? "error" : ticket.priority === "Medium" ? "warning" : "default"}
            size="small"
            sx={{ mt: 1 }}
          />

          {assignedUser && (
            <Avatar
              src={assignedUser.avatar || "https://via.placeholder.com/50"}
              alt={assignedUser.username}
              sx={{ width: 40, height: 40, mt: 2 }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={editedTicket.title}
            onChange={(e) => setEditedTicket({ ...editedTicket, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editedTicket.description}
            onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={editedTicket.priority}
              onChange={(e) => setEditedTicket({ ...editedTicket, priority: e.target.value })}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Assign User</InputLabel>
            <Select
                value={editedTicket.assigned_user_id ? String(editedTicket.assigned_user_id) : ""}
                onChange={(e) =>
                    setEditedTicket({
                    ...editedTicket,
                    assigned_user_id: e.target.value ? Number(e.target.value) : null,
                    })
                }
              >
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
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TicketCard;
