import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";

export default function App() {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );
  const isAuthenticated = Boolean(user && localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Navbar user={isAuthenticated ? user : null} onLogout={() => setUser(null)} />

      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Profile user={user} /> : <Landing />}
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/products"
          element={
            isAuthenticated ? <Products /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/cart"
          element={
            isAuthenticated ? <Cart /> : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}