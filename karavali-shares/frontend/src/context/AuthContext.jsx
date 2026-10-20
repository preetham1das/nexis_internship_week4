import { createContext, useContext, useMemo, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("karavali_user")) || null; }
    catch { return null; }
  });

  async function register(values) {
    const { data } = await api.post("/auth/register", values);
    saveSession(data);
    return data;
  }

  async function login(values) {
    const { data } = await api.post("/auth/login", values);
    saveSession(data);
    return data;
  }

  function saveSession(data) {
    localStorage.setItem("karavali_token", data.token);
    localStorage.setItem("karavali_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("karavali_token");
    localStorage.removeItem("karavali_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, register, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
