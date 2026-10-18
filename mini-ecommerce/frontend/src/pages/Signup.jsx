import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/auth/signup", form);
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="auth-card">
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          minLength={6}
          required
        />

        <button type="submit">Sign Up</button>
      </form>

      {message && <p className="error">{message}</p>}
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}