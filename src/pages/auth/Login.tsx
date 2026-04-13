import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const demoAccounts = [
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
    const account = demoAccounts.find(a => a.email === email && a.password === password);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🇷🇼</div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your Enjoy Rwanda account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] active:scale-95 transition-all shadow-md"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="relative text-center mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400">
            or try a demo account
          </span>
        </div>

        {/* Demo Accounts */}
        <div className="space-y-2 mb-6">
          {demoAccounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => quickLogin(acc)}
              className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 hover:border-[#1a1a2e] hover:bg-gray-50 transition-all"
            >
              <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {acc.role}
              </span>
              <span className="text-sm text-gray-600">{acc.email}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#1a1a2e] font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
