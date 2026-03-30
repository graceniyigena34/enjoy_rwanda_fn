import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { restaurants } from "../data/mockData";
import "./ListPage.css";

export default function Restaurants() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [cuisine, setCuisine] = useState("All");

  const cuisines = ["All", ...Array.from(new Set(restaurants.map((r) => r.cuisine)))];

  const filtered = restaurants.filter((r) => {
    const matchQ = r.name.toLowerCase().includes(query.toLowerCase()) || r.location.toLowerCase().includes(query.toLowerCase());
    const matchC = cuisine === "All" || r.cuisine === cuisine;
    return matchQ && matchC;
  });

  return (
    <div className="list-page">
      <div className="list-header">
        <h1>Restaurants in Rwanda</h1>
        <p>Discover and book the best dining experiences</p>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="filter-input"
        />
        <div className="filter-tabs">
          {cuisines.map((c) => (
            <button key={c} className={`tab ${cuisine === c ? "active" : ""}`} onClick={() => setCuisine(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="cards-grid">
        {filtered.length === 0 ? (
          <p className="no-results">No restaurants found. Try a different search.</p>
        ) : (
          filtered.map((r) => (
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
                  <span className="rating">⭐ {r.rating} · {r.priceRange}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
