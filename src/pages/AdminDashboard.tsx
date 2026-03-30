import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Dashboard.css";

type Tab = "overview" | "users" | "vendors" | "reports";

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

export default function AdminDashboard() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [vendors, setVendors] = useState(mockVendors);

  if (!user || user.role !== "admin") {
    return (
      <div className="dash-unauthorized">
        <p>Access denied. <Link to="/login">Login as admin</Link></p>
      </div>
    );
  }

  const updateVendor = (id: number, status: string) =>
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status } : v));

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>
      </div>

      <div className="dash-tabs">
        {(["overview", "users", "vendors", "reports"] as Tab[]).map((t) => (
          <button key={t} className={`dash-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "overview" && "📊 Overview"}
            {t === "users" && "👥 Users"}
            {t === "vendors" && "🏪 Vendors"}
            {t === "reports" && "📈 Reports"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="dash-overview">
          <div className="stat-cards">
            <div className="stat-card"><span className="stat-num">3</span><p>Total Users</p></div>
            <div className="stat-card"><span className="stat-num">3</span><p>Vendors</p></div>
            <div className="stat-card"><span className="stat-num">40</span><p>Total Orders</p></div>
            <div className="stat-card"><span className="stat-num">2</span><p>Pending Approvals</p></div>
          </div>
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <ul>
              <li>🏪 New vendor registration: <strong>Diane Uwimana</strong> — awaiting approval</li>
              <li>👤 New user registered: <strong>Claire Mukamana</strong></li>
              <li>🛒 Order <strong>ORD-015</strong> completed successfully</li>
              <li>💬 Complaint received from <strong>Alice Uwase</strong></li>
            </ul>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="dash-section">
          <h3>All Users</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {mockUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td><span className="status-badge confirmed">{u.status}</span></td>
                    <td className="action-btns">
                      <button className="btn-sm reject">Suspend</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "vendors" && (
        <div className="dash-section">
          <h3>Vendor Approvals</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Owner</th><th>Business</th><th>Type</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.business}</td>
                    <td>{v.type}</td>
                    <td><span className={`status-badge ${v.status === "approved" ? "confirmed" : "pending"}`}>{v.status}</span></td>
                    <td className="action-btns">
                      {v.status === "pending" && (
                        <>
                          <button className="btn-sm accept" onClick={() => updateVendor(v.id, "approved")}>Approve</button>
                          <button className="btn-sm reject" onClick={() => updateVendor(v.id, "rejected")}>Reject</button>
                        </>
                      )}
                      {v.status !== "pending" && <span className="done-label">Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="dash-section">
          <h3>System Reports</h3>
          <div className="reports-grid">
            <div className="report-card">
              <h4>📦 Orders This Month</h4>
              <p className="report-num">40</p>
              <p className="report-sub">+12% from last month</p>
            </div>
            <div className="report-card">
              <h4>💰 Revenue This Month</h4>
              <p className="report-num">580,000 RWF</p>
              <p className="report-sub">+8% from last month</p>
            </div>
            <div className="report-card">
              <h4>📅 Bookings This Month</h4>
              <p className="report-num">18</p>
              <p className="report-sub">+5% from last month</p>
            </div>
            <div className="report-card">
              <h4>💬 Complaints</h4>
              <p className="report-num">2</p>
              <p className="report-sub">1 resolved, 1 pending</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
