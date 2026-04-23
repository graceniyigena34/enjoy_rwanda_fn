import { useEffect, useState } from "react";

type GuestOrder = {
  id: string;
  date: string;
  items: string[];
  total: number;
  status: string;
  vendor: string;
  paymentScope?: "reservation-only" | "reservation+menu" | "cart";
  payLaterTotal?: number;
  payLaterItems?: string[];
};

const statusStyle: Record<string, string> = {
  delivered: "bg-green-50 text-green-700",
  processing: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-600",
};

export default function Orders() {
  const [orders, setOrders] = useState<GuestOrder[]>([]);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("enjoy-rwanda.guestOrders") ?? "[]",
    ) as GuestOrder[];
    setOrders(stored);
  }, []);

  if (orders.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">📋</div>
        <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-gray-500 text-sm">
          Your orders will appear here after you complete a payment.
        </p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">
                  {order.id}
                </span>
                <span className="text-xs text-gray-400">{order.date}</span>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[order.status]}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">📍 {order.vendor}</p>
            <p className="text-sm text-gray-600 mb-3">
              {order.items.join(", ")}
            </p>
            {order.paymentScope === "reservation-only" &&
              (order.payLaterTotal ?? 0) > 0 && (
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Menu payment pending at restaurant:{" "}
                  {(order.payLaterTotal ?? 0).toLocaleString()} RWF
                  {Array.isArray(order.payLaterItems) &&
                  order.payLaterItems.length > 0
                    ? ` (${order.payLaterItems.join(", ")})`
                    : ""}
                </div>
              )}
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">
                {order.total.toLocaleString()} RWF
              </span>
              {order.status === "processing" && (
                <span className="text-xs text-yellow-600 font-medium">
                  🔄 In Progress
                </span>
              )}
              {order.status === "delivered" && (
                <span className="text-xs text-green-600 font-medium">
                  ✅ Delivered
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
