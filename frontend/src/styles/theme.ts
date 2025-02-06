// src/styles/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", 
    },
    secondary: {
      main: "#dc004e",  
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff", 
    },
  },
  typography: {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
    h1: { fontSize: "2.5rem", fontWeight: 600 },
    h2: { fontSize: "2rem", fontWeight: 500 },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: "20px",
          paddingBottom: "20px",
          paddingLeft: "24px",   // ✅ Add left padding
          paddingRight: "24px",  // ✅ Add right padding
          maxWidth: "1200px",    // ✅ Optional: Limit max width for better layout
          margin: "0 auto", 
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", 
          borderRadius: "8px", 
        },
      },
    },
  },
});

export default theme;
