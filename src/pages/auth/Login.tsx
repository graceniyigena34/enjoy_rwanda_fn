import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./Auth.css";

const demoAccounts = [
  { email: "visitor@demo.com", password: "demo123", name: "Alice Uwase", role: "visitor" as const, id: 1 },
  { email: "vendor@demo.com", password: "demo123", name: "Bob Nkurunziza", role: "vendor" as const, id: 2 },
  { email: "admin@demo.com", password: "demo123", name: "Admin Rwanda", role: "admin" as const, id: 3 },
];

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = demoAccounts.find((a) => a.email === email && a.password === password);
    if (!account) { setError("Invalid email or password."); return; }
    login({ id: account.id, name: account.name, email: account.email, role: account.role });
    if (account.role === "vendor") navigate("/vendor");
    else if (account.role === "admin") navigate("/admin");
    else navigate("/");
  };

  const quickLogin = (acc: typeof demoAccounts[0]) => {
    login({ id: acc.id, name: acc.name, email: acc.email, role: acc.role });
    if (acc.role === "vendor") navigate("/vendor");
    else if (acc.role === "admin") navigate("/admin");
    else navigate("/");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🇷🇼</div>
        <h1>Welcome Back</h1>
        <p className="auth-sub">Sign in to your Enjoy Rwanda account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }} required />
          </div>
          <button type="submit" className="btn-primary auth-btn">Login</button>
        </form>

        <div className="auth-divider"><span>or try a demo account</span></div>

        <div className="demo-accounts">
          {demoAccounts.map((acc) => (
            <button key={acc.id} className="demo-btn" onClick={() => quickLogin(acc)}>
              <span className="demo-role">{acc.role}</span>
              <span className="demo-email">{acc.email}</span>
            </button>
          ))}
        </div>

        <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
