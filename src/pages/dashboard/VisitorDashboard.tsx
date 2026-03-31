import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./Dashboard.css";

const favoriteSpots = [
  { id: 1, name: "Kigali Serena Restaurant", type: "Restaurant" },
  { id: 2, name: "Inzozi Fashion", type: "Shop" },
  { id: 3, name: "Rwanda Coffee Corner", type: "Shop" },
];

const recommended = [
  { id: 1, name: "Mountain View Restaurant", note: "Top rated Rwandan cuisine" },
  { id: 2, name: "Akagera Craft Shop", note: "Local souvenirs and gifts" },
  { id: 3, name: "Lake Kivu Lodge", note: "Relaxing stay and dining" },
];

export default function VisitorDashboard() {
  const { user, cart, cartTotal, orders } = useApp();
  if (!user || user.role !== "visitor") {
    return (
      <div className="dash-unauthorized">
        <p>Access denied. <Link to="/login">Login as visitor</Link></p>
      </div>
    );
  }

  const orderCount = orders.length;
  const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const recentOrders = orders.slice(-3).reverse();

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>Visitor Dashboard</h1>
          <p>Welcome back, {user.name}. Track your plans, orders, and favorites in one place.</p>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card"><span className="stat-num">{orderCount}</span><p>Orders placed</p></div>
        <div className="stat-card"><span className="stat-num">{cartItems}</span><p>Items in cart</p></div>
        <div className="stat-card"><span className="stat-num">{favoriteSpots.length}</span><p>Saved places</p></div>
        <div className="stat-card"><span className="stat-num">{recommended.length}</span><p>Recommended spots</p></div>
      </div>

      <div className="recent-activity">
        <h3>Quick actions</h3>
        <ul>
          <li>🛒 Continue shopping from your cart</li>
          <li>📍 Explore more restaurants and shops near you</li>
          <li>⭐ Review your latest visit or favorite a new place</li>
        </ul>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/restaurants" className="btn-primary-sm-green">Browse Restaurants</Link>
          <Link to="/shops" className="btn-primary-sm-green">Browse Shops</Link>
          <Link to="/orders" className="btn-primary-sm-green">View Orders</Link>
        </div>
      </div>

      <div className="dash-section">
        <h3>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h2>No recent orders yet</h2>
            <p>Order now from local restaurants and shops.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Date</th><th>Vendor</th><th>Status</th><th>Total</th></tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.vendor}</td>
                    <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                    <td>{order.total.toLocaleString()} RWF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dash-section">
        <div className="section-head">
          <h3>Saved favorites</h3>
          <span className="report-sub">Personalized for you</span>
        </div>
        <div className="menu-manage-list">
          {favoriteSpots.map((spot) => (
            <div key={spot.id} className="menu-manage-item">
              <div>
                <strong>{spot.name}</strong>
                <span className="item-cat">{spot.type}</span>
              </div>
              <span>{spot.type === "Restaurant" ? "🍽️" : "🛍️"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-section">
        <h3>Recommended for you</h3>
        <div className="reports-grid">
          {recommended.map((spot) => (
            <div key={spot.id} className="report-card">
              <h4>{spot.name}</h4>
              <p>{spot.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-section">
        <h3>Cart summary</h3>
        <div className="report-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="report-num">{cartItems} items</p>
            <p className="report-sub">Total {cartTotal.toLocaleString()} RWF</p>
          </div>
          <Link to="/cart" className="btn-primary-sm-green">Go to cart</Link>
        </div>
      </div>
    </div>
  );
}
