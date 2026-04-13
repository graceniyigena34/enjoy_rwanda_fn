import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function Register() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    login({ id: Date.now(), name: form.name, email: form.email, role: "visitor" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🇷🇼</div>
          <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Enjoy Rwanda today</p>
          <p className="text-gray-400 text-xs mt-2">Visitor accounts can register here. Vendor/admin accounts are created by an admin.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", field: "name", type: "text", placeholder: "Your full name" },
            { label: "Email", field: "email", type: "email", placeholder: "you@example.com" },
            { label: "Password", field: "password", type: "password", placeholder: "Min. 6 characters" },
            { label: "Confirm Password", field: "confirm", type: "password", placeholder: "Repeat password" },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
              <input type={type} placeholder={placeholder} value={form[field as keyof typeof form]}
                onChange={e => { set(field, e.target.value); setError(""); }} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
            </div>
          ))}
          <button type="submit" className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors">Create Account</button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">Already have an account? <Link to="/login" className="text-[#1a1a2e] font-semibold hover:underline">Login</Link></p>
      </div>
    </div>
  );
}
