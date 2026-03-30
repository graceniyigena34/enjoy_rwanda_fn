import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Auth.css";

export default function Register() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "visitor" as "visitor" | "vendor" });
  const [error, setError] = useState("");

  const set = (field: string, val: string) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    login({ id: Date.now(), name: form.name, email: form.email, role: form.role });
    navigate(form.role === "vendor" ? "/vendor" : "/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🇷🇼</div>
        <h1>Create Account</h1>
        <p className="auth-sub">Join Enjoy Rwanda today</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your full name" value={form.name}
              onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => { set("email", e.target.value); setError(""); }} required />
          </div>
          <div className="form-group">
            <label>I am a</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="visitor">Visitor</option>
              <option value="vendor">Vendor (Restaurant / Shop Owner)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={(e) => { set("password", e.target.value); setError(""); }} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Repeat password" value={form.confirm}
              onChange={(e) => { set("confirm", e.target.value); setError(""); }} required />
          </div>
          <button type="submit" className="btn-primary auth-btn">Create Account</button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
