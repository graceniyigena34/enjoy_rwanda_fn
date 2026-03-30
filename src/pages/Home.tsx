import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { featuredItems } from "../data/mockData";
import "./Home.css";

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "restaurants" | "shops">("all");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/${filter === "shops" ? "shops" : "restaurants"}?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Discover the Best of Rwanda</h1>
          <p>Book restaurants, explore shops, and experience Rwanda like never before.</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">All</option>
              <option value="restaurants">Restaurants</option>
              <option value="shops">Shops</option>
            </select>
            <input
              type="text"
              placeholder="Search restaurants, shops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="stat"><span>50+</span><p>Restaurants</p></div>
        <div className="stat"><span>100+</span><p>Shops</p></div>
        <div className="stat"><span>1000+</span><p>Happy Visitors</p></div>
        <div className="stat"><span>24/7</span><p>Support</p></div>
      </section>

      {/* Featured Restaurants */}
      <section className="section">
        <div className="section-header">
          <h2>Featured Restaurants</h2>
          <Link to="/restaurants" className="see-all">See All →</Link>
        </div>
        <div className="cards-grid">
          {featuredItems.restaurants.map((r) => (
            <Link to={`/restaurants/${r.id}`} key={r.id} className="card">
              <img src={r.image} alt={r.name} />
              <div className="card-body">
                <div className="card-top">
                  <h3>{r.name}</h3>
                  <span className="badge">{r.cuisine}</span>
                </div>
                <p>{r.description}</p>
                <div className="card-footer">
                  <span>📍 {r.location}</span>
                  <span className="rating">⭐ {r.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Shops */}
      <section className="section section-alt">
        <div className="section-header">
          <h2>Featured Shops</h2>
          <Link to="/shops" className="see-all">See All →</Link>
        </div>
        <div className="cards-grid">
          {featuredItems.shops.map((s) => (
            <Link to={`/shops/${s.id}`} key={s.id} className="card">
              <img src={s.image} alt={s.name} />
              <div className="card-body">
                <div className="card-top">
                  <h3>{s.name}</h3>
                  <span className="badge badge-shop">{s.category}</span>
                </div>
                <p>{s.description}</p>
                <div className="card-footer">
                  <span>📍 {s.location}</span>
                  <span className="rating">⭐ {s.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step"><div className="step-icon">🔍</div><h4>Browse</h4><p>Explore restaurants and shops near you</p></div>
          <div className="step"><div className="step-icon">📅</div><h4>Book or Order</h4><p>Reserve a table or add items to cart</p></div>
          <div className="step"><div className="step-icon">💳</div><h4>Pay Securely</h4><p>Pay via card or mobile money</p></div>
          <div className="step"><div className="step-icon">🎉</div><h4>Enjoy</h4><p>Experience the best of Rwanda</p></div>
        </div>
      </section>
    </div>
  );
}
