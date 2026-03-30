import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Dashboard.css";

const mockBookings = [
  { id: 1, visitor: "Alice Uwase", table: "T2", date: "2025-07-15", time: "19:00", status: "confirmed" },
  { id: 2, visitor: "Jean Pierre", table: "T4", date: "2025-07-16", time: "12:30", status: "pending" },
];

const mockVendorOrders = [
  { id: "ORD-010", visitor: "Alice Uwase", items: ["Grilled Tilapia", "Matoke"], total: 17000, status: "pending" },
  { id: "ORD-011", visitor: "Marie Claire", items: ["Brochettes"], total: 8000, status: "processing" },
];

type Tab = "overview" | "bookings" | "orders" | "menu";

export default function VendorDashboard() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState(mockBookings);
  const [orders, setOrders] = useState(mockVendorOrders);

  if (!user || user.role !== "vendor") {
    return (
      <div className="dash-unauthorized">
        <p>Access denied. <Link to="/login">Login as vendor</Link></p>
      </div>
    );
  }

  const updateBooking = (id: number, status: string) =>
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));

  const updateOrder = (id: string, status: string) =>
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>Vendor Dashboard</h1>
          <p>Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="dash-tabs">
        {(["overview", "bookings", "orders", "menu"] as Tab[]).map((t) => (
          <button key={t} className={`dash-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "overview" && "📊 Overview"}
            {t === "bookings" && "📅 Bookings"}
            {t === "orders" && "🛒 Orders"}
            {t === "menu" && "🍽️ Menu/Products"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="dash-overview">
          <div className="stat-cards">
            <div className="stat-card"><span className="stat-num">12</span><p>Total Bookings</p></div>
            <div className="stat-card"><span className="stat-num">28</span><p>Total Orders</p></div>
            <div className="stat-card"><span className="stat-num">245,000</span><p>Revenue (RWF)</p></div>
            <div className="stat-card"><span className="stat-num">4.7 ⭐</span><p>Avg Rating</p></div>
          </div>
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <ul>
              <li>📅 New booking from <strong>Alice Uwase</strong> for July 15</li>
              <li>🛒 New order <strong>ORD-011</strong> received</li>
              <li>💬 New message from <strong>Jean Pierre</strong></li>
            </ul>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="dash-section">
          <h3>Manage Bookings</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Visitor</th><th>Table</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.visitor}</td>
                    <td>{b.table}</td>
                    <td>{b.date}</td>
                    <td>{b.time}</td>
                    <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                    <td className="action-btns">
                      {b.status === "pending" && (
                        <>
                          <button className="btn-sm accept" onClick={() => updateBooking(b.id, "confirmed")}>Accept</button>
                          <button className="btn-sm reject" onClick={() => updateBooking(b.id, "rejected")}>Reject</button>
                        </>
                      )}
                      {b.status !== "pending" && <span className="done-label">Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="dash-section">
          <h3>Manage Orders</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Order ID</th><th>Visitor</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.visitor}</td>
                    <td>{o.items.join(", ")}</td>
                    <td>{o.total.toLocaleString()} RWF</td>
                    <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                    <td className="action-btns">
                      {o.status === "pending" && (
                        <button className="btn-sm accept" onClick={() => updateOrder(o.id, "processing")}>Process</button>
                      )}
                      {o.status === "processing" && (
                        <button className="btn-sm accept" onClick={() => updateOrder(o.id, "delivered")}>Mark Delivered</button>
                      )}
                      {o.status === "delivered" && <span className="done-label">✅ Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div className="dash-section">
          <div className="section-head">
            <h3>Menu / Products</h3>
            <button className="btn-primary-sm-green">+ Add Item</button>
          </div>
          <div className="menu-manage-list">
            {[
              { id: 1, name: "Grilled Tilapia", price: 12000, category: "Main" },
              { id: 2, name: "Brochettes", price: 8000, category: "Snack" },
              { id: 3, name: "Isombe", price: 6000, category: "Side" },
            ].map((item) => (
              <div key={item.id} className="menu-manage-item">
                <div>
                  <strong>{item.name}</strong>
                  <span className="item-cat">{item.category}</span>
                </div>
                <div className="menu-item-actions">
                  <span className="price-tag">{item.price.toLocaleString()} RWF</span>
                  <button className="btn-sm edit">Edit</button>
                  <button className="btn-sm reject">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
