import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <div className="footer-logo">
              <svg viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 38 C22 38 6 27 6 16 C6 10.477 10.477 6 16 6 C18.9 6 21.5 7.3 22 8 C22.5 7.3 25.1 6 28 6 C33.523 6 38 10.477 38 16 C38 27 22 38 22 38Z" fill="#1a1a2e"/>
                <text x="22" y="21" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="system-ui, sans-serif">RW</text>
              </svg>
            </div>
            <div className="footer-brand-text">
              <span className="fb-top">Enjoy</span>
              <span className="fb-bottom">Rwanda</span>
            </div>
          </div>
          <p>Your gateway to authentic Rwandan experiences. Shop local crafts and discover the best restaurants.</p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shops">Imigongo Art</Link></li>
            <li><Link to="/shops">Agaseke Baskets</Link></li>
            <li><Link to="/shops">Coffee &amp; Tea</Link></li>
            <li><Link to="/shops">Jewelry</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Restaurants</h4>
          <ul>
            <li><Link to="/restaurants">Kigali</Link></li>
            <li><Link to="/restaurants">Musanze</Link></li>
            <li><Link to="/restaurants">Rubavu</Link></li>
            <li><Link to="/restaurants">Huye</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="contact-list">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              hello@enjoyrwanda.com
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
              +250 788 000 000
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Kigali, Rwanda
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Enjoy Rwanda. All rights reserved.</span>
        <span>Made with ♥ in Rwanda</span>
      </div>
    </footer>
  );
}
