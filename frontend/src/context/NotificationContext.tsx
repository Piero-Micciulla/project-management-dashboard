import React, { createContext, useState, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

interface Notification {
  message: string;
  severity: "success" | "error" | "warning" | "info";
  open: boolean;
}

interface NotificationContextType {
  notify: (message: string, severity: Notification["severity"]) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification>({ message: "", severity: "info", open: false });

  const notify = (message: string, severity: Notification["severity"]) => {
    setNotification({ message, severity, open: true });
  };

  const handleClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
