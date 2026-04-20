import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

type UnavailableState = {
  restaurantName?: string;
  timedOut?: boolean;
};

export default function BookingUnavailable() {
  const location = useLocation();
  const state = (location.state || {}) as UnavailableState;

  const heading = useMemo(() => {
    if (state.timedOut) return "No response in time";
    return "Booking request unavailable";
  }, [state.timedOut]);

  const message = useMemo(() => {
    if (state.timedOut) {
      return "The business did not confirm your booking within 3 minutes. Please try a different slot or contact the business directly.";
    }
    return "The business rejected this booking request. Please choose another date/time and try again.";
  }, [state.timedOut]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-red-100 shadow-xl p-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-red-50 text-red-600 grid place-items-center text-2xl">
          !
        </div>
        <h1 className="mt-4 text-2xl font-black text-gray-900">{heading}</h1>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
        <p className="mt-2 text-xs text-gray-500">
          {state.restaurantName ? `Business: ${state.restaurantName}` : ""}
        </p>

        <div className="mt-7 flex gap-3 justify-center">
          <Link
            to="/restaurants"
            className="px-5 py-2.5 rounded-xl bg-[#1a1a2e] text-white text-sm font-semibold hover:bg-[#2d2d4e]"
          >
            Find another table
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
