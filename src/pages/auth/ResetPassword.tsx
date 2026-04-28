import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiValidateResetToken, apiResetPassword } from "../../utils/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const navigate = useNavigate();

  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setValid(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        await apiValidateResetToken(token, email);
        setValid(true);
      } catch (err) {
        setValid(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6)
      return setError("Password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);
      await apiResetPassword(token, email, newPassword);
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Invalid or expired link</h2>
          <p className="text-sm text-gray-600 mb-4">
            The password reset link is invalid or has expired.
          </p>
          <div>
            <Link to="/forgot-password" className="text-[#1a1a2e] font-medium">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        {loading && (
          <div className="text-sm text-gray-600 mb-3">Checking link...</div>
        )}
        {error && <div className="text-red-600 mb-3">{error}</div>}

        {valid ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                New password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a2e] text-white py-2 rounded font-semibold disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        ) : (
          <div className="text-sm text-gray-600">Validating link...</div>
        )}
      </div>
    </div>
  );
}
