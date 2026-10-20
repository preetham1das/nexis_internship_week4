import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Waves } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect to the server. Check that the backend is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-art">
        <div className="auth-art-content">
          <div className="auth-icon"><Waves size={32} /></div>
          <p className="eyebrow">NAMMA KARAVALI</p>
          <h1>Every story keeps our culture alive.</h1>
          <p>Share the food, festivals, Kambala, Daiva Kola and beautiful traditions of coastal Karnataka.</p>
        </div>
      </section>
      <section className="auth-card">
        <p className="eyebrow">{isRegister ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</p>
        <h2>{isRegister ? "Create your account" : "Sign in to Karavali Shares"}</h2>
        <p className="muted">{isRegister ? "Start sharing your corner of the coast." : "Your community is waiting for you."}</p>
        <form onSubmit={submit} className="stack-form">
          {isRegister && <label>Your name<input name="name" value={form.name} onChange={update} required maxLength={60} placeholder="e.g. Preetham" /></label>}
          <label>Email address<input type="email" name="email" value={form.email} onChange={update} required placeholder="you@example.com" /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={update} required minLength={6} placeholder="At least 6 characters" /></label>
          {error && <p className="error-message">{error}</p>}
          <button className="primary-button" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account" : "Login"} <ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Karavali Shares?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Login" : "Create account"}</Link></p>
      </section>
    </main>
  );
}
