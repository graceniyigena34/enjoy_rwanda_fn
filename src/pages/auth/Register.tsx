import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { apiRegister } from "../../utils/api";

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
      const { token, user: u } = await apiRegister(
        form.name,
        form.email,
        form.password,
        form.phone.trim() || undefined,
        "vendor"
      );

      login(
        {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as "visitor" | "vendor" | "admin",
          roles: [u.role],
        },
        token
      );

      navigate("/vendor");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🇷🇼</div>
          <h1 className="text-2xl font-black text-gray-900">Create Vendor Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Join Enjoy Rwanda as a vendor
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {[
            {
              label: "Full Name",
              field: "name",
              type: "text",
              placeholder: "Your full name",
              required: true,
            },
            {
              label: "Email",
              field: "email",
              type: "email",
              placeholder: "you@example.com",
              required: true,
            },
            {
              label: "Phone Number (Optional)",
              field: "phone",
              type: "tel",
              placeholder: "+250 XXX XXX XXX",
              required: false,
            },
            {
              label: "Password",
              field: "password",
              type: "password",
              placeholder: "Min. 6 characters",
              required: true,
            },
            {
              label: "Confirm Password",
              field: "confirm",
              type: "password",
              placeholder: "Repeat password",
              required: true,
            },
          ].map(({ label, field, type, placeholder, required }) => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={(e) => set(field, e.target.value)}
                required={required}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a1a2e] focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Vendor Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1a1a2e] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
