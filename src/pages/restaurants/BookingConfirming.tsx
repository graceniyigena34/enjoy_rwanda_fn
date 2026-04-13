import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TOTAL = 120;
const STORAGE_KEY = "enjoy-rwanda.confirmingBooking";

export default function BookingConfirming() {
  const navigate = useNavigate();

  const [startTime] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return Number(stored);
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    return now;
  });

  const elapsed = () => Math.floor((Date.now() - startTime) / 1000);
  const [countdown, setCountdown] = useState(() => Math.max(0, TOTAL - elapsed()));
  const [dismissed, setDismissed] = useState(false);

  // Block browser back/forward navigation during countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [countdown <= 0]);

  useEffect(() => {
    if (countdown <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      navigate("/payment");
      return;
    }
    const t = setTimeout(() => setCountdown(Math.max(0, TOTAL - elapsed())), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Poll for early vendor confirmation
  useEffect(() => {
    const bookingId = localStorage.getItem("enjoy-rwanda.lastBookingId");
    if (!bookingId) return;
    const interval = setInterval(() => {
      if (localStorage.getItem(`booking-confirmed-${bookingId}`) === "confirmed") {
        clearInterval(interval);
        localStorage.removeItem(STORAGE_KEY);
        navigate("/payment");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const progress = ((TOTAL - countdown) / TOTAL) * 100;
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const isDone = countdown <= 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 gap-4">

      {/* Notification banner */}
      {!dismissed && (
        <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
          <span className="text-xl mt-0.5">⚠️</span>
          <div className="flex-1 text-sm text-amber-800">
            <p className="font-semibold mb-0.5">Please stay on this page</p>
            <p className="text-amber-700">Do not navigate away. You will be automatically redirected to the payment page once your booking is confirmed (up to 2 minutes).</p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 text-lg leading-none mt-0.5">✕</button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md text-center">
        <div className="text-6xl mb-6 animate-pulse">⏳</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Confirming Your Booking</h1>
        <p className="text-gray-500 text-sm mb-8">
          Please wait while the vendor confirms your reservation. You will be redirected to payment automatically.
        </p>

        <div className="text-4xl font-black text-[#1a1a2e] mb-6 tabular-nums">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className="bg-[#1a1a2e] h-3 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mb-6">
          {isDone ? "Redirecting to payment..." : "Waiting for vendor/admin confirmation..."}
        </p>

        <button
          disabled={!isDone}
          onClick={() => { localStorage.removeItem(STORAGE_KEY); navigate("/payment"); }}
          className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isDone ? "Go to Payment →" : `Available in ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
        </button>
      </div>
    </div>
  );
}
