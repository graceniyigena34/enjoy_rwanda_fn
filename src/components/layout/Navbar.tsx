import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
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
        <div className="brand-logo">
          <svg viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 38 C22 38 6 27 6 16 C6 10.477 10.477 6 16 6 C18.9 6 21.5 7.3 22 8 C22.5 7.3 25.1 6 28 6 C33.523 6 38 10.477 38 16 C38 27 22 38 22 38Z" fill="#1a1a2e"/>
            <text x="22" y="21" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="system-ui, sans-serif">RW</text>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-top">Enjoy</span>
          <span className="brand-bottom">Rwanda</span>
        </div>
      </Link>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        &#9776;
      </button>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li><Link to="/shops" onClick={() => setMenuOpen(false)}>Shop</Link></li>
        <li><Link to="/restaurants" onClick={() => setMenuOpen(false)}>Restaurants</Link></li>
        <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
        {user?.role === "visitor" && <li><Link to="/visitor" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>}
        {user?.role === "vendor" && <li><Link to="/vendor" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>}
        {user?.role === "admin" && <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>}
      </ul>

      <div className="nav-actions">
        <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <>
            <button className="nav-icon-btn" aria-label="Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            <button onClick={handleLogout} className="btn-signin">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-icon-btn" aria-label="Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <Link to="/login" className="btn-signin">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}
