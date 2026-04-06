import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const mockUsers = [
  { id: 1, name: "Alice Uwase", email: "alice@demo.com", role: "visitor", status: "active" },
  { id: 2, name: "Bob Nkurunziza", email: "bob@demo.com", role: "vendor", status: "active" },
  { id: 3, name: "Claire Mukamana", email: "claire@demo.com", role: "visitor", status: "active" },
];
const mockVendors = [
  { id: 1, name: "Bob Nkurunziza", business: "Kigali Serena Restaurant", type: "Restaurant", status: "approved" },
  { id: 2, name: "Diane Uwimana", business: "Inzozi Fashion", type: "Shop", status: "pending" },
  { id: 3, name: "Eric Habimana", business: "Kigali Fresh Market", type: "Shop", status: "pending" },
];

type Tab = "overview" | "users" | "vendors" | "reports";

const navItems: { tab: Tab; icon: string; label: string }[] = [
  { tab: "overview", icon: "📊", label: "Overview" },
  { tab: "users", icon: "👥", label: "Users" },
  { tab: "vendors", icon: "🏪", label: "Vendors" },
  { tab: "reports", icon: "📈", label: "Reports" },
];

export default function AdminDashboard() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [vendors, setVendors] = useState(mockVendors);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const pendingApprovals = vendors.filter(v => v.status === "pending").length;
  const approvedVendors = vendors.filter(v => v.status === "approved").length;

  if (!user || user.role !== "admin")
    return (
      <div className="p-10 text-center">
        Access denied.{" "}
        <Link to="/login" className="text-blue-600 underline">Login as admin</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} shrink-0 bg-[#1a1a2e] text-white flex flex-col transition-all duration-300 min-h-screen`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#1a1a2e] font-black text-xs">RW</span>
          </div>
          {sidebarOpen && <span className="font-black text-sm tracking-tight">Enjoy Rwanda</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ tab: t, icon, label }) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-base shrink-0">{icon}</span>
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && t === "vendors" && pendingApprovals > 0 && (
                <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingApprovals}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {user.name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-xs text-white/50">Admin</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className={`ml-auto rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 ${sidebarOpen ? "" : "px-2"}`}
              aria-label="Sign out"
              title="Sign out"
            >
              {sidebarOpen ? "Sign out" : "⎋"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="text-slate-500 hover:text-slate-900 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">
                {navItems.find(n => n.tab === tab)?.icon} {navItems.find(n => n.tab === tab)?.label}
              </h1>
              <p className="text-xs text-slate-400">Welcome back, {user.name?.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingApprovals > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                {pendingApprovals} pending approval{pendingApprovals > 1 ? "s" : ""}
              </span>
            )}
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">● Live</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: mockUsers.length, icon: "👥", color: "bg-blue-50 text-blue-700" },
                  { label: "Approved Vendors", value: approvedVendors, icon: "🏪", color: "bg-green-50 text-green-700" },
                  { label: "Total Orders", value: 40, icon: "🛒", color: "bg-purple-50 text-purple-700" },
                  { label: "Pending Approvals", value: pendingApprovals, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.color}`}>{item.label}</span>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <p className="text-4xl font-black text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                  <ul className="space-y-3">
                    {[
                      { icon: "📅", title: "New booking from Alice Uwase", time: "2 min ago" },
                      { icon: "🛒", title: "New order ORD-011 received", time: "15 min ago" },
                      { icon: "🏪", title: "Vendor Diane Uwimana registered", time: "1 hr ago" },
                      { icon: "💬", title: "Support ticket from Jean Pierre", time: "3 hr ago" },
                    ].map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-base mt-0.5">{a.icon}</span>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{a.title}</p>
                          <p className="text-slate-400 text-xs">{a.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pending Vendors */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">Pending Vendor Approvals</h3>
                  {vendors.filter(v => v.status === "pending").length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">All vendors approved ✅</p>
                  ) : (
                    <ul className="space-y-3">
                      {vendors.filter(v => v.status === "pending").map(v => (
                        <li key={v.id} className="flex items-center justify-between text-sm border border-slate-100 rounded-xl p-3">
                          <div>
                            <p className="font-semibold text-slate-900">{v.business}</p>
                            <p className="text-xs text-slate-400">{v.name} · {v.type}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "approved" } : x))} className="bg-green-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600">Approve</button>
                            <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "rejected" } : x))} className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600">Reject</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">All Users</h2>
                  <p className="text-sm text-slate-400">{mockUsers.length} registered users</p>
                </div>
                <button className="bg-[#1a1a2e] !text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2d2d4e]">+ Invite User</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                        <th key={h} className="pb-3 font-semibold text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="py-3 text-slate-500">{u.email}</td>
                        <td className="py-3"><span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{u.role}</span></td>
                        <td className="py-3"><span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">{u.status}</span></td>
                        <td className="py-3"><button className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600">Suspend</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Vendors ── */}
          {tab === "vendors" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Vendor Approvals</h2>
                  <p className="text-sm text-slate-400">{pendingApprovals} pending · {approvedVendors} approved</p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">{pendingApprovals} pending review</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      {["Owner", "Business", "Type", "Status", "Actions"].map(h => (
                        <th key={h} className="pb-3 font-semibold text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(v => (
                      <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="py-3 font-medium text-slate-900">{v.name}</td>
                        <td className="py-3 text-slate-500">{v.business}</td>
                        <td className="py-3 text-slate-600">{v.type}</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            v.status === "approved" ? "bg-green-50 text-green-700" :
                            v.status === "rejected" ? "bg-red-50 text-red-700" :
                            "bg-yellow-50 text-yellow-700"
                          }`}>{v.status}</span>
                        </td>
                        <td className="py-3">
                          {v.status === "pending" ? (
                            <div className="flex gap-2">
                              <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "approved" } : x))} className="bg-green-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600">Approve</button>
                              <button onClick={() => setVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: "rejected" } : x))} className="bg-red-500 !text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600">Reject</button>
                            </div>
                          ) : <span className="text-xs text-slate-400">Completed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Reports ── */}
          {tab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { title: "Orders This Month", value: "40", detail: "+12% from last month", icon: "📦" },
                  { title: "Revenue", value: "580,000 RWF", detail: "+8% from last month", icon: "💰" },
                  { title: "Bookings", value: "18", detail: "+5% from last month", icon: "📅" },
                  { title: "Complaints", value: "2", detail: "1 resolved, 1 pending", icon: "💬" },
                ].map(item => (
                  <div key={item.title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">This month</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 mb-1">{item.value}</p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Platform Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Total Revenue", value: "2,450,000 RWF", icon: "💰" },
                    { label: "Total Bookings", value: "86", icon: "📅" },
                    { label: "Active Vendors", value: approvedVendors.toString(), icon: "🏪" },
                    { label: "Registered Users", value: mockUsers.length.toString(), icon: "👥" },
                    { label: "Avg Order Value", value: "14,500 RWF", icon: "🛒" },
                    { label: "Satisfaction Rate", value: "94%", icon: "⭐" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 border border-slate-100 rounded-xl p-4">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900">{item.value}</p>
                        <p className="text-xs text-slate-400">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
