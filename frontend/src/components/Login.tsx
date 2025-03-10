import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

const Login = () => {
  const { login } = useContext(AuthContext)!;
  const { notify } = useContext(NotificationContext)!;
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false); // ✅ Guest Loading State

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, form);
      const token = response.data.token;
      login(form.email, token);
      notify("Login successful!", "success");
    } catch (err: any) {
      notify(err.response?.data?.error || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    setError("");

    try {
      const guestCredentials = { email: "guest@email.com", password: "guest123" };
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, guestCredentials);
      const token = response.data.token;
      login(guestCredentials.email, token);
      notify("Logged in as Guest!", "success");
    } catch (err: any) {
      notify(err.response?.data?.error || "Guest login failed", "error");
    } finally {
      setGuestLoading(false);
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
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
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
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleGuestLogin}
            disabled={guestLoading}
          >
            {guestLoading ? <CircularProgress size={24} /> : "Login as Guest"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
