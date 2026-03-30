import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

export default function Navbar() {
  const { cart, user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🇷🇼 Enjoy Rwanda
      </Link>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        ☰
      </button>
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/restaurants" onClick={() => setMenuOpen(false)}>Restaurants</Link></li>
        <li><Link to="/shops" onClick={() => setMenuOpen(false)}>Shops</Link></li>
        <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
        {user?.role === "vendor" && <li><Link to="/vendor" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>}
        {user?.role === "admin" && <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>}
      </ul>
      <div className="nav-actions">
        <Link to="/cart" className="cart-btn">
          🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        {user ? (
          <div className="user-menu">
            <span className="user-name">👤 {user.name}</span>
            <button onClick={handleLogout} className="btn-outline-sm">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary-sm">Login</Link>
        )}
      </div>
    </nav>
  );
}
