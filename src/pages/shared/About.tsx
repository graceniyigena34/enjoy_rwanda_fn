import { Link } from "react-router-dom";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Enjoy Rwanda</h1>
        <p>Connecting visitors with the best of Rwanda's restaurants and shops since 2025.</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Enjoy Rwanda is a digital platform designed to simplify how visitors explore services in Rwanda.
            We connect tourists and locals with restaurants, shops, and local vendors — making it easy to
            browse, book, and order from one convenient platform.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="offer-grid">
            <div className="offer-card">
              <span>🍽️</span>
              <h4>Restaurant Booking</h4>
              <p>Browse restaurants, view menus, select tables, and make reservations online.</p>
            </div>
            <div className="offer-card">
              <span>🛍️</span>
              <h4>Shop & Order</h4>
              <p>Explore local shops, browse products, and order authentic Rwandan goods.</p>
            </div>
            <div className="offer-card">
              <span>💳</span>
              <h4>Secure Payments</h4>
              <p>Pay via card, MTN Mobile Money, Airtel Money, or PayPal — safely and securely.</p>
            </div>
            <div className="offer-card">
              <span>💬</span>
              <h4>Live Chat</h4>
              <p>Chat directly with vendors for inquiries, special requests, or support.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Team</h2>
          <p>
            We are a passionate team based in Kigali, Rwanda, dedicated to supporting local businesses
            and improving the visitor experience through technology.
          </p>
        </section>

        <div className="about-cta">
          <h3>Ready to explore Rwanda?</h3>
          <div className="cta-btns">
            <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
            <Link to="/shops" className="btn-outline">Explore Shops</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
