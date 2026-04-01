import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const mockOrders = [
  { id: "ORD-001", date: "2025-07-10", items: ["Grilled Tilapia", "Isombe"], total: 18000, status: "delivered", vendor: "Kigali Serena Restaurant" },
  { id: "ORD-002", date: "2025-07-08", items: ["Agaseke Basket", "Rwandan Fabric"], total: 23000, status: "processing", vendor: "Rwanda Craft Market" },
  { id: "ORD-003", date: "2025-07-05", items: ["Rwandan Coffee (1kg)"], total: 12000, status: "confirmed", vendor: "Kigali Fresh Market" },
];

const statusStyle: Record<string, string> = {
  delivered: "bg-green-50 text-green-700",
  processing: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-600",
};

export default function Orders() {
  const { user } = useApp();

  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">📋</div>
      <h2 className="text-xl font-bold text-gray-900">Please log in to view your orders</h2>
      <Link to="/login" className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors">Login</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>
      <div className="space-y-4">
        {mockOrders.map(order => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                <span className="text-xs text-gray-400">{order.date}</span>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[order.status]}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">📍 {order.vendor}</p>
            <p className="text-sm text-gray-600 mb-3">{order.items.join(", ")}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{order.total.toLocaleString()} RWF</span>
              {order.status === "processing" && <span className="text-xs text-yellow-600 font-medium">🔄 In Progress</span>}
              {order.status === "delivered" && <span className="text-xs text-green-600 font-medium">✅ Delivered</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
