import React, { useState } from "react";
import { api } from "../api";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Input,
} from "@mui/material";
import axios from "axios";

const Register: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "", // ✅ New field for avatar URL
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // ✅ Store the selected image file
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // ✅ Upload avatar to Cloudinary before submitting form
  const uploadAvatar = async () => {
    if (!avatarFile) return null; // If no file, return null

    const formData = new FormData();
    formData.append("file", avatarFile);
    formData.append("upload_preset", "your_upload_preset"); // ✅ Replace with your Cloudinary Upload Preset
    formData.append("folder", "user_avatars");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", // ✅ Replace with your Cloudinary Cloud Name
        formData
      );
      return response.data.secure_url; // ✅ Return uploaded image URL
    } catch (error) {
      console.error("Avatar upload failed:", error);
      return null;
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Upload avatar if file is selected
      const avatarUrl = await uploadAvatar();
      const requestData = { ...form, avatar: avatarUrl || "" }; // If upload fails, send empty avatar field

      // ✅ Send registration data to backend
      const response = await api.post("/auth/register", requestData);
      console.log(response);
      alert("User registered successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 5,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="email"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            type="password"
            required
          />

          <Input
            type="file"
            inputProps={{ accept: "image/*" }}
            fullWidth
            sx={{ mt: 2 }}
            onChange={handleFileChange}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
