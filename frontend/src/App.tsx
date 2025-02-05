import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Register from "./components/Register";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserList from "./components/UserList";
import UserProfile from "./components/UserProfile";

const App = () => {
  const authContext = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authContext) {
      setIsLoading(false);
    }
  }, [authContext]);

  // 🔍 Debugging logs
  console.log("AuthContext:", authContext);
  console.log("Is Loading:", isLoading);

  return (
    <Router>
      <div className="App">
        <h1>Project Management Dashboard</h1>

        {isLoading ? (
          <div>Loading...</div>
        ) : !authContext?.token ? (
          <>
            <nav>
              <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
            </nav>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </>
        ) : (
          <>
            <nav>
              <Link to="/dashboard">Dashboard</Link> |{" "}
              {authContext.isAdmin && <Link to="/users">Manage Users</Link>} |{" "}
              <Link to="/profile">Profile</Link> |{" "}
              <button onClick={authContext.logout}>Logout</button>
            </nav>

            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              {authContext.isAdmin && <Route path="/users" element={<UserList />} />}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
