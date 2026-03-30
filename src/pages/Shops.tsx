import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { shops } from "../data/mockData";
import "./ListPage.css";

export default function Shops() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(shops.map((s) => s.category)))];

  const filtered = shops.filter((s) => {
    const matchQ = s.name.toLowerCase().includes(query.toLowerCase()) || s.location.toLowerCase().includes(query.toLowerCase());
    const matchC = category === "All" || s.category === category;
    return matchQ && matchC;
  });

  return (
    <div className="list-page">
      <div className="list-header">
        <h1>Shops in Rwanda</h1>
        <p>Browse local products and unique Rwandan goods</p>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search shops..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="filter-input"
        />
        <div className="filter-tabs">
          {categories.map((c) => (
            <button key={c} className={`tab ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="cards-grid">
        {filtered.length === 0 ? (
          <p className="no-results">No shops found. Try a different search.</p>
        ) : (
          filtered.map((s) => (
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
          ))
        )}
      </div>
    </div>
  );
}
