import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { apiLogin } from "../../utils/api";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { token, user: u } = await apiLogin(email, password);

      login(
        {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as "vendor" | "admin",
          roles: [u.role],
        },
        token
      );

      if (u.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/vendor");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🇷🇼</div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your Enjoy Rwanda account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
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
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] active:scale-95 transition-all shadow-md disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#1a1a2e] font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
