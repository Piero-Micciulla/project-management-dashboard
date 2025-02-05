import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from "@mui/material";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const loggedInUserId = Number(localStorage.getItem("userId")); // Get the logged-in user ID

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Fetch Users from API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch users.");
    }
  };

  // ✅ Handle Open Dialog for Edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  // ✅ Handle Avatar Upload
  const handleAvatarUpload = async (userId?: number) => {
    if (!selectedAvatar) return;

    try {
      const formData = new FormData();
      formData.append("avatar", selectedAvatar);
      const token = localStorage.getItem("token");

      // ✅ Correct API endpoint for admins vs regular users
      const endpoint =
        userId && userId !== loggedInUserId
          ? `/api/users/${userId}/avatar` // Admin uploading for another user
          : `/api/users/me/avatar`; // Regular user updating their own avatar

      await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Avatar uploaded successfully!");
      fetchUsers();
      setSelectedAvatar(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload avatar.");
    }
  };

  // ✅ Handle Update User
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${editingUser.id}`,
        { username: editingUser.username, email: editingUser.email, role: editingUser.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (selectedAvatar) {
        await handleAvatarUpload(editingUser.id);
      }

      alert("User updated successfully!");
      fetchUsers();
      setOpenDialog(false);
      setEditingUser(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update user.");
    }
  };

  // ✅ Handle Add New User
  const handleAddUser = async () => {
    try {
      console.log("Sending user data:", newUser); // ✅ Log request body
  
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
  
      console.log("User registered:", response.data); // ✅ Log response
  
      const userId = response.data.id;
  
      if (selectedAvatar) {
        console.log("Uploading avatar...");
        await handleAvatarUpload(userId);
      }
  
      fetchUsers();
      setNewUser({ username: "", email: "", password: "", role: "user" });
      setOpenDialog(false);
      setSelectedAvatar(null);
    } catch (err: any) {
      console.error("Error adding user:", err.response?.data || err);
      setError(err.response?.data?.error || "Failed to add user.");
    }
  };
    

  // ✅ Handle Delete User
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete user.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        variant="contained"
        color="success"
        style={{ marginBottom: "15px" }}
        onClick={() => {
          setEditingUser(null);
          setOpenDialog(true);
        }}
      >
        + Add User
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Avatar</strong></TableCell>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar src={user.avatar || "https://via.placeholder.com/50"} alt={user.username} />
                </TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(user)}>Edit</Button>
                  <Button variant="contained" color="error" size="small" onClick={() => handleDelete(user.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Username" margin="normal"
            value={editingUser ? editingUser.username : newUser.username}
            onChange={(e) => editingUser ? setEditingUser({ ...editingUser, username: e.target.value }) : setNewUser({ ...newUser, username: e.target.value })}
          />
          <TextField fullWidth label="Email" type="email" margin="normal"
            value={editingUser ? editingUser.email : newUser.email}
            onChange={(e) => editingUser ? setEditingUser({ ...editingUser, email: e.target.value }) : setNewUser({ ...newUser, email: e.target.value })}
          />
            {!editingUser && (
                <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={newUser.password}
                onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                }
                />
            )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={editingUser ? editingUser.role : newUser.role}
              onChange={(e) => editingUser ? setEditingUser({ ...editingUser, role: e.target.value }) : setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" component="label">
            Upload Avatar <input type="file" hidden onChange={(e) => setSelectedAvatar(e.target.files?.[0] || null)} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>{editingUser ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList;
