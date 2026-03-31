import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./Orders.css";

const statusColor: Record<string, string> = {
  delivered: "#38a169",
  processing: "#d69e2e",
  confirmed: "#3182ce",
  cancelled: "#e53e3e",
};

export default function Orders() {
  const { user, orders } = useApp();

  if (!user) {
    return (
      <div className="orders-empty">
        <div className="empty-icon">📋</div>
        <h2>Please log in to view your orders</h2>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Start exploring restaurants and shops</p>
          <Link to="/restaurants" className="btn-primary">Browse Now</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <span className="order-id">{order.id}</span>
                  <span className="order-date">{order.date}</span>
                </div>
                <span className="order-status" style={{ color: statusColor[order.status] }}>
                  ● {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="order-body">
                <p className="order-vendor">📍 {order.vendor}</p>
                <p className="order-items">{order.items.map((item) => item.name).join(", ")}</p>
              </div>
              <div className="order-footer">
                <span className="order-total">{order.total.toLocaleString()} RWF</span>
                {order.status === "processing" && (
                  <span className="track-badge">🔄 In Progress</span>
                )}
                {order.status === "delivered" && (
                  <span className="track-badge delivered">✅ Delivered</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
