import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { apiLogin } from "../../utils/api";
import heroImage from "../../assets/hero.jpg";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { token, user: u } = await apiLogin(form.email, form.password);

      login(
        {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as "visitor" | "vendor" | "manager" | "admin",
          roles: [u.role],
        },
        token,
      );

      if (u.role === "admin") {
        navigate("/admin");
      } else if (u.role === "vendor" || u.role === "manager") {
        navigate("/vendor");
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a1a2e] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
            filter: "brightness(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/80 to-[#1a1a2e]/60" />

        <div className="relative z-10 flex flex-col justify-center px-8 xl:px-16 text-white">
          <div className="mb-8">
            <h1 className="text-4xl xl:text-5xl font-black mb-4 leading-tight">
              Welcome to
              <br />
              <span className="text-5xl xl:text-6xl">Enjoy Rwanda </span>
            </h1>
            <div className="w-20 h-1 bg-white rounded-full mb-6"></div>
            <p className="text-lg xl:text-xl text-gray-200 leading-relaxed">
              Login to access your dashboard and manage your business.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-[#1a1a2e]">
              Welcome to Enjoy Rwanda
            </h2>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a2e] mb-2">
              Sign In
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Login to your account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* EMAIL */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all"
              />
              <div className="mt-2 text-sm text-right">
                <Link
                  to="/forgot-password"
                  className="text-[#1a1a2e] font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a2e] text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-[#2d2d4e] active:scale-98 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#1a1a2e] font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
