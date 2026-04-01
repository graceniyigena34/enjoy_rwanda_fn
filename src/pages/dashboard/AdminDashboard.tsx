import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const mockUsers = [{id:1,name:"Alice Uwase",email:"alice@demo.com",role:"visitor",status:"active"},{id:2,name:"Bob Nkurunziza",email:"bob@demo.com",role:"vendor",status:"active"},{id:3,name:"Claire Mukamana",email:"claire@demo.com",role:"visitor",status:"active"}];
const mockVendors = [{id:1,name:"Bob Nkurunziza",business:"Kigali Serena Restaurant",type:"Restaurant",status:"approved"},{id:2,name:"Diane Uwimana",business:"Inzozi Fashion",type:"Shop",status:"pending"},{id:3,name:"Eric Habimana",business:"Kigali Fresh Market",type:"Shop",status:"pending"}];
type Tab = "overview"|"users"|"vendors"|"reports";

export default function AdminDashboard() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [vendors, setVendors] = useState(mockVendors);

  if (!user || user.role !== "admin") return <div className="p-10 text-center">Access denied. <Link to="/login" className="text-blue-600 underline">Login as admin</Link></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8"><h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1><p className="text-gray-500">System overview and management</p></div>
      <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
        {(["overview","users","vendors","reports"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-all ${tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
            {t === "overview" && "📊 Overview"}{t === "users" && "👥 Users"}{t === "vendors" && "🏪 Vendors"}{t === "reports" && "📈 Reports"}
          </button>
        ))}
      </div>

      {tab === "overview" && <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["3","Total Users"],["3","Vendors"],["40","Total Orders"],["2","Pending Approvals"]].map(([num,label]) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm"><div className="text-3xl font-black text-gray-900 mb-1">{num}</div><p className="text-sm text-gray-500">{label}</p></div>
          ))}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"><h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3><ul className="space-y-2 text-sm text-gray-600">{["🏪 New vendor registration: Diane Uwimana — awaiting approval","👤 New user registered: Claire Mukamana","🛒 Order ORD-015 completed successfully","💬 Complaint received from Alice Uwase"].map((a,i) => <li key={i} dangerouslySetInnerHTML={{__html:a}} />)}</ul></div>
      </div>}

      {tab === "users" && <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-gray-900 mb-4">All Users</h3>
        <table className="w-full text-sm"><thead className="border-b border-gray-200"><tr className="text-left text-gray-500">{["Name","Email","Role","Status","Actions"].map(h => <th key={h} className="pb-3 font-semibold">{h}</th>)}</tr></thead><tbody>{mockUsers.map(u => <tr key={u.id} className="border-b border-gray-100"><td className="py-3">{u.name}</td><td>{u.email}</td><td><span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-700">{u.role}</span></td><td><span className="text-xs px-2 py-1 rounded-full font-medium bg-green-50 text-green-700">{u.status}</span></td><td><button className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-red-600">Suspend</button></td></tr>)}</tbody></table>
      </div>}

      {tab === "vendors" && <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-gray-900 mb-4">Vendor Approvals</h3>
        <table className="w-full text-sm"><thead className="border-b border-gray-200"><tr className="text-left text-gray-500">{["Owner","Business","Type","Status","Actions"].map(h => <th key={h} className="pb-3 font-semibold">{h}</th>)}</tr></thead><tbody>{vendors.map(v => <tr key={v.id} className="border-b border-gray-100"><td className="py-3">{v.name}</td><td>{v.business}</td><td>{v.type}</td><td><span className={`text-xs px-2 py-1 rounded-full font-medium ${v.status === "approved" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{v.status}</span></td><td>{v.status === "pending" ? <div className="flex gap-2"><button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? {...x, status:"approved"} : x))} className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-green-600">Approve</button><button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? {...x, status:"rejected"} : x))} className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-red-600">Reject</button></div> : <span className="text-xs text-gray-400">Done</span>}</td></tr>)}</tbody></table>
      </div>}

      {tab === "reports" && <div className="space-y-4">
        <h3 className="font-bold text-gray-900">System Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[["📦 Orders This Month","40","+12% from last month"],["💰 Revenue This Month","580,000 RWF","+8% from last month"],["📅 Bookings This Month","18","+5% from last month"],["💬 Complaints","2","1 resolved, 1 pending"]].map(([title,num,sub]) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"><h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4><p className="text-2xl font-black text-gray-900 mb-1">{num}</p><p className="text-xs text-gray-400">{sub}</p></div>
          ))}
        </div>
      </div>}
    </div>
  );
}
