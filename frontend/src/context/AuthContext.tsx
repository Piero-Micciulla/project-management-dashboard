import React, { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, token: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      console.log("Fetching user profile...");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = (email: string, newToken: string) => {
    console.log("Logging in with token:", newToken);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    fetchUserProfile();
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  console.log("AuthContext State:", { token, user, isLoading });

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAdmin: user?.role === "admin" }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
