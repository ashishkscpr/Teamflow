import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore user on app load
  useEffect(() => {
    const token = localStorage.getItem("tf_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Auth restore failed:", err);
        localStorage.removeItem("tf_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("tf_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // ✅ Signup
  const signup = async (name, email, password, role) => {
    const res = await api.post("/auth/signup", {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("tf_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("tf_token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
