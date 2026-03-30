import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>🇷🇼 Enjoy Rwanda</h3>
          <p>Connecting visitors with the best of Rwanda's restaurants and shops.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/restaurants">Restaurants</Link></li>
            <li><Link to="/shops">Shops</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p>📍 Kigali, Rwanda</p>
          <p>📧 info@enjoyRwanda.rw</p>
          <p>📞 +250 788 000 000</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Enjoy Rwanda. All rights reserved.</p>
      </div>
    </footer>
  );
}
