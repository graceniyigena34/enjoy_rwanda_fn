import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { apiRegister } from "../../utils/api";
import heroImage from "../../assets/hero.jpg";
import PhoneNumberInput, {
  splitInternationalPhone,
} from "../../components/forms/PhoneNumberInput";

export default function Register() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const parsedPhone = splitInternationalPhone(form.phone);
      const normalizedPhone = parsedPhone.localNumber;

      const { token, user: u } = await apiRegister(
        form.name,
        form.email,
        form.password,
        normalizedPhone || undefined,
        normalizedPhone ? parsedPhone.countryCode : undefined,
        "vendor",
      );

      login(
        {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as "visitor" | "vendor" | "admin",
          roles: [u.role],
        },
        token,
      );

      navigate("/vendor");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a1a2e] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
            filter: "brightness(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/80 to-[#1a1a2e]/60" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-black mb-4 leading-tight">
              Welcome to
              <br />
              <span className="text-6xl">Enjoy Rwanda</span>
            </h1>
            <div className="w-20 h-1 bg-white rounded-full mb-6"></div>
            <p className="text-xl text-gray-200 leading-relaxed">
              Join our platform and showcase your business to thousands of
              visitors exploring the beauty of Rwanda.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-2xl font-black text-[#1a1a2e]">
              Welcome to Enjoy Rwanda
            </h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#1a1a2e] mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join as a vendor and start your journey
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Phone Number{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <PhoneNumberInput
                value={form.phone}
                onChange={(value) => set("phone", value)}
                defaultCountryIso2="RW"
                placeholder="7XXXXXXXX"
              />
              <p className="mt-1 text-xs text-gray-500">
                Choose country, then continue typing number after the code.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-4 focus:ring-gray-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a2e] text-white py-3.5 rounded-xl font-bold hover:bg-[#2d2d4e] active:scale-98 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
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
                  Creating your account...
                </span>
              ) : (
                "Create Vendor Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#1a1a2e] font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
