import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { restaurants } from "../../data/mockData";
import heroBg from "../../assets/hero.jpg";
import "./Home.css";

const cuisineFilters = ["All", "Rwandan", "International", "Asian", "African", "European"];

type SearchTab = "Shop" | "Restaurants" | "Events";

export default function Home() {
  const [searchTab, setSearchTab] = useState<SearchTab>("Restaurants");
  const [location, setLocation] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const navigate = useNavigate();

  const filtered = restaurants.filter((r) =>
    cuisineFilter === "All" || r.cuisine === cuisineFilter
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTab === "Shop") navigate("/shops");
    else navigate(`/restaurants${location ? `?q=${encodeURIComponent(location)}` : ""}`);
  };

  return (
    <div className="home">

      {/* Hero */}
      <section className="hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>
            Experience the Best of <span className="hero-highlight">Rwanda</span>
          </h1>
          <p>
            Shop authentic crafts delivered to your hotel or book the finest restaurants<br />
            with a consumable deposit
          </p>

          {/* Search card */}
          <div className="search-card">
            <div className="search-tabs">
              {(["Shop", "Restaurants", "Events"] as SearchTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`search-tab ${searchTab === tab ? "active" : ""}`}
                  onClick={() => setSearchTab(tab)}
                >
                  {tab === "Shop" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  )}
                  {tab === "Restaurants" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
                  )}
                  {tab === "Events" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  )}
                  {tab}
                </button>
              ))}
            </div>

            <form className="search-row" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <input
                  type="text"
                  placeholder="Enter your hotel or location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="search-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Search
              </button>
            </form>

            <div className="search-badges">
              <span className="badge-dot green" />
              <span>Fast Delivery</span>
              <span className="badge-dot black" />
              <span>20,000 RWF Consumable Deposit</span>
              <span className="badge-dot orange" />
              <span>Authentic Local Products</span>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants section */}
      <section className="restaurants-section">
        <div className="section-top">
          <div className="section-title-block">
            <h2>Best Restaurants in Rwanda</h2>
            <p>Book a table with 20,000 RWF consumable deposit</p>
          </div>
          <div className="cuisine-filters">
            {cuisineFilters.map((c) => (
              <button
                key={c}
                className={`cuisine-pill ${cuisineFilter === c ? "active" : ""}`}
                onClick={() => setCuisineFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="restaurant-grid">
          {filtered.map((r) => (
            <div key={r.id} className="restaurant-card">
              <div className="card-image-wrap">
                <img src={r.image} alt={r.name} />
                {r.status === "Open" && <span className="open-badge">Open</span>}
                <div className="card-image-name">{r.name}</div>
              </div>
              <div className="card-info">
                <div className="card-info-row">
                  <span className="card-cuisine">{r.cuisine}</span>
                  <span className="card-price">{r.priceRange}</span>
                </div>
                <div className="card-meta">
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <strong>{r.rating}</strong>
                    <span className="meta-muted">({r.reviews})</span>
                  </span>
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>{r.hours}</span>
                  </span>
                </div>
                <div className="card-location">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{r.location}</span>
                </div>
                <div className="card-divider" />
                <div className="card-deposit">
                  Reservation deposit: <strong>{r.deposit.toLocaleString()} RWF</strong>
                </div>
                <div className="card-actions">
                  <Link to={`/restaurants/${r.id}`} className="btn-view">View Details</Link>
                  <Link to={`/restaurants/${r.id}`} className="btn-book">Book</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
