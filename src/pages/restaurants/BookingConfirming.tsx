import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBookingPublicStatus } from "../../utils/api";

const TOTAL_SECONDS = 300;
const CONTEXT_KEY = "enjoy-rwanda.pendingBookingContext";
const PAYMENT_CONTEXT_KEY = "enjoy-rwanda.paymentContext";

type PendingMenuItem = {
  name: string;
  price: number;
};

type PendingBookingContext = {
  bookingId: number;
  email: string;
  restaurantName: string;
  reservationAmount?: number;
  menuItems?: PendingMenuItem[];
  menuTotal?: number;
  numberOfPeople?: number;
  date?: string;
  time?: string;
};

type WaitingStatus = "pending" | "confirmed" | "cancelled";

export default function BookingConfirming() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  const context = useMemo(() => {
    const raw = localStorage.getItem(CONTEXT_KEY);
    let fromStorage: PendingBookingContext | null = null;
    try {
      if (raw) {
        const parsed = JSON.parse(raw) as PendingBookingContext;
        if (parsed.bookingId && parsed.email) {
          fromStorage = {
            bookingId: Number(parsed.bookingId),
            email: String(parsed.email),
            restaurantName: String(parsed.restaurantName || "Restaurant"),
            reservationAmount: Number(parsed.reservationAmount || 0),
            menuItems: Array.isArray(parsed.menuItems)
              ? parsed.menuItems.filter(
                  (item) =>
                    typeof item?.name === "string" &&
                    Number.isFinite(Number(item?.price)),
                )
              : [],
            menuTotal: Number(parsed.menuTotal || 0),
            numberOfPeople: Number(parsed.numberOfPeople || 0),
            date: parsed.date ? String(parsed.date) : "",
            time: parsed.time ? String(parsed.time) : "",
          };
        }
      }
    } catch {
      fromStorage = null;
    }

    const state = (location.state || {}) as PendingBookingContext;
    if (state.bookingId && state.email) {
      const fromState = {
        bookingId: Number(state.bookingId),
        email: String(state.email),
        restaurantName: String(state.restaurantName || "Restaurant"),
        reservationAmount: Number(state.reservationAmount || 0),
        menuItems: Array.isArray(state.menuItems)
          ? state.menuItems.filter(
              (item) =>
                typeof item?.name === "string" &&
                Number.isFinite(Number(item?.price)),
            )
          : [],
        menuTotal: Number(state.menuTotal || 0),
        numberOfPeople: Number(state.numberOfPeople || 0),
        date: state.date ? String(state.date) : "",
        time: state.time ? String(state.time) : "",
      };

      if (
        fromStorage &&
        Number(fromStorage.bookingId) === Number(fromState.bookingId)
      ) {
        return {
          ...fromStorage,
          ...fromState,
          reservationAmount:
            fromState.reservationAmount > 0
              ? fromState.reservationAmount
              : Number(fromStorage.reservationAmount || 0),
          menuItems:
            fromState.menuItems.length > 0
              ? fromState.menuItems
              : fromStorage.menuItems || [],
          menuTotal:
            fromState.menuTotal > 0
              ? fromState.menuTotal
              : Number(fromStorage.menuTotal || 0),
        };
      }

      return fromState;
    }

    return fromStorage;
  }, [location.state]);

  const [countdown, setCountdown] = useState(TOTAL_SECONDS);
  const [status, setStatus] = useState<WaitingStatus>("pending");
  const [statusError, setStatusError] = useState("");
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!context) {
      setStatusError("Missing booking context. Please book your table again.");
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, TOTAL_SECONDS - elapsed);
      setCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [context]);

  const pollStatus = useCallback(async () => {
    if (!context) return;
    try {
      const res = await getBookingPublicStatus(
        context.bookingId,
        context.email,
      );
      setLastCheckedAt(new Date().toLocaleTimeString());
      if (res.status === "confirmed") {
        setStatus("confirmed");
        localStorage.setItem(
          PAYMENT_CONTEXT_KEY,
          JSON.stringify({
            bookingId: context.bookingId,
            email: context.email,
            restaurantName: context.restaurantName,
            reservationAmount: Number(context.reservationAmount || 0),
            menuItems: Array.isArray(context.menuItems)
              ? context.menuItems
              : [],
            menuTotal: Number(context.menuTotal || 0),
            numberOfPeople: Number(context.numberOfPeople || 0),
            date: context.date || "",
            time: context.time || "",
            approvedAt: Date.now(),
          }),
        );
        localStorage.removeItem(CONTEXT_KEY);
        navigate("/payment", { replace: true });
        return;
      }
      if (res.status === "cancelled") {
        setStatus("cancelled");
        localStorage.removeItem(CONTEXT_KEY);
        navigate("/booking-unavailable", {
          replace: true,
          state: { restaurantName: context.restaurantName },
        });
      }
      setStatusError("");
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : "Could not refresh booking status.",
      );
    }
  }, [context, navigate]);

  useEffect(() => {
    if (!context) return;
    if (status !== "pending") return;

    let stopped = false;
    const poll = async () => {
      try {
        if (stopped) return;
        await pollStatus();
      } finally {
        if (!stopped) {
          // no-op: interval drives the next refresh
        }
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 3000);

    const handleFocus = () => {
      void poll();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void poll();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [context, navigate, pollStatus, status]);

  useEffect(() => {
    if (countdown > 0) return;
    if (status !== "pending") return;
    localStorage.removeItem(CONTEXT_KEY);
    navigate("/booking-unavailable", {
      replace: true,
      state: {
        restaurantName: context?.restaurantName || "Restaurant",
        timedOut: true,
      },
    });
  }, [context?.restaurantName, countdown, navigate, status]);

  const progress = ((TOTAL_SECONDS - countdown) / TOTAL_SECONDS) * 100;
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 gap-4">
      {!dismissed && (
        <div className="w-full max-w-md bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
          <span className="text-xl mt-0.5">!</span>
          <div className="flex-1 text-sm text-amber-800">
            <p className="font-semibold mb-0.5">Please stay on this page</p>
            <p className="text-amber-700">
              Your request has been sent to the business. You will be updated
              automatically within 5 minutes.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-500 hover:text-amber-700 text-lg leading-none mt-0.5"
          >
            x
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md text-center">
        <div className="text-6xl mb-6 animate-pulse">...</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Booking Request Pending
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Waiting for business approval. If approved, you will be redirected to
          payment instantly.
        </p>

        <div className="text-4xl font-black text-[#1a1a2e] mb-6 tabular-nums">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-[#1a1a2e] h-3 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mb-2">
          Booking ID: {context?.bookingId ?? "-"}
        </p>
        <p className="text-xs text-gray-400 mb-2">
          {lastCheckedAt
            ? `Last refreshed at ${lastCheckedAt}`
            : "Checking for updates..."}
        </p>
        {!!statusError && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            {statusError}
          </p>
        )}
      </div>
    </div>
  );
}
