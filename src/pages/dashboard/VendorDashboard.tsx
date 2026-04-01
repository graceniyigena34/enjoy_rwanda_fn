import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const mockBookings = [
  { id: 1, visitor: "Alice Uwase", table: "T2", date: "2025-07-15", time: "19:00", status: "confirmed" },
  { id: 2, visitor: "Jean Pierre", table: "T4", date: "2025-07-16", time: "12:30", status: "pending" },
];
const mockOrders = [
  { id: "ORD-010", visitor: "Alice Uwase", items: ["Grilled Tilapia", "Matoke"], total: 17000, status: "pending" },
  { id: "ORD-011", visitor: "Marie Claire", items: ["Brochettes"], total: 8000, status: "processing" },
];
type Tab = "overview"|"bookings"|"orders"|"menu";

export default function VendorDashboard() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState(mockBookings);
  const [orders, setOrders] = useState(mockOrders);

  if (!user || user.role !== "vendor") return <div className="p-10 text-center">Access denied. <Link to="/login" className="text-blue-600 underline">Login as vendor</Link></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8"><h1 className="text-3xl font-black text-gray-900">Vendor Dashboard</h1><p className="text-gray-500">Welcome back, {user.name}</p></div>
      <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
        {(["overview","bookings","orders","menu"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-all ${tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
            {t === "overview" && "📊 Overview"}{t === "bookings" && "📅 Bookings"}{t === "orders" && "🛒 Orders"}{t === "menu" && "🍽️ Menu"}
          </button>
        ))}
      </div>

      {tab === "overview" && <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["12","Total Bookings"],["28","Total Orders"],["245,000","Revenue (RWF)"],["4.7 ⭐","Avg Rating"]].map(([num,label]) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm"><div className="text-3xl font-black text-gray-900 mb-1">{num}</div><p className="text-sm text-gray-500">{label}</p></div>
          ))}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"><h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3><ul className="space-y-2 text-sm text-gray-600">{["📅 New booking from Alice Uwase for July 15","🛒 New order ORD-011 received","💬 New message from Jean Pierre"].map((a,i) => <li key={i} dangerouslySetInnerHTML={{__html:a}} />)}</ul></div>
      </div>}

      {tab === "bookings" && <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-gray-900 mb-4">Manage Bookings</h3>
        <table className="w-full text-sm"><thead className="border-b border-gray-200"><tr className="text-left text-gray-500">{["Visitor","Table","Date","Time","Status","Actions"].map(h => <th key={h} className="pb-3 font-semibold">{h}</th>)}</tr></thead><tbody>{bookings.map(b => <tr key={b.id} className="border-b border-gray-100"><td className="py-3">{b.visitor}</td><td>{b.table}</td><td>{b.date}</td><td>{b.time}</td><td><span className={`text-xs px-2 py-1 rounded-full font-medium ${b.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{b.status}</span></td><td>{b.status === "pending" ? <div className="flex gap-2"><button onClick={() => setBookings(prev => prev.map(x => x.id === b.id ? {...x, status:"confirmed"} : x))} className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-green-600">Accept</button><button onClick={() => setBookings(prev => prev.filter(x => x.id !== b.id))} className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-red-600">Reject</button></div> : <span className="text-xs text-gray-400">Done</span>}</td></tr>)}</tbody></table>
      </div>}

      {tab === "orders" && <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-gray-900 mb-4">Manage Orders</h3>
        <table className="w-full text-sm"><thead className="border-b border-gray-200"><tr className="text-left text-gray-500">{["Order ID","Visitor","Items","Total","Status","Actions"].map(h => <th key={h} className="pb-3 font-semibold">{h}</th>)}</tr></thead><tbody>{orders.map(o => <tr key={o.id} className="border-b border-gray-100"><td className="py-3">{o.id}</td><td>{o.visitor}</td><td>{o.items.join(", ")}</td><td>{o.total.toLocaleString()} RWF</td><td><span className={`text-xs px-2 py-1 rounded-full font-medium ${o.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"}`}>{o.status}</span></td><td>{o.status === "pending" ? <button onClick={() => setOrders(prev => prev.map(x => x.id === o.id ? {...x, status:"processing"} : x))} className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-600">Process</button> : o.status === "processing" ? <button onClick={() => setOrders(prev => prev.map(x => x.id === o.id ? {...x, status:"delivered"} : x))} className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-green-600">Mark Delivered</button> : <span className="text-xs text-gray-400">✅ Done</span>}</td></tr>)}</tbody></table>
      </div>}

      {tab === "menu" && <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-900">Menu / Products</h3><button className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600">+ Add Item</button></div>
        <div className="space-y-3">{[{id:1,name:"Grilled Tilapia",price:12000,category:"Main"},{id:2,name:"Brochettes",price:8000,category:"Snack"},{id:3,name:"Isombe",price:6000,category:"Side"}].map(item => <div key={item.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4"><div><strong className="text-gray-900">{item.name}</strong><span className="text-xs text-gray-400 ml-2">{item.category}</span></div><div className="flex items-center gap-3"><span className="font-semibold text-gray-700">{item.price.toLocaleString()} RWF</span><button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-600">Edit</button><button className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-red-600">Delete</button></div></div>)}</div>
      </div>}
    </div>
  );
}
