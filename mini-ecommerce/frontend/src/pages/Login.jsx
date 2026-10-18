import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/auth/login", form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onLogin(response.data.user);

      navigate("/profile", { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>

      <form onSubmit={handleSubmit}>
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
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          required
        />

        <button type="submit">Login</button>
      </form>

      {message && <p className="error">{message}</p>}
      <p>New user? <Link to="/signup">Create an account</Link></p>
    </div>
  );
}