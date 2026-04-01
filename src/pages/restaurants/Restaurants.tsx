import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { restaurants } from "../../data/mockData";

export default function Restaurants() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [cuisine, setCuisine] = useState("All");
  const cuisines = ["All", ...Array.from(new Set(restaurants.map(r => r.cuisine)))];
  const filtered = restaurants.filter(r => {
    const matchQ = r.name.toLowerCase().includes(query.toLowerCase()) || r.location.toLowerCase().includes(query.toLowerCase());
    return matchQ && (cuisine === "All" || r.cuisine === cuisine);
  });

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Restaurants in Rwanda</h1>
        <p className="text-gray-500">Discover and book the best dining experiences</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input type="text" placeholder="Search restaurants..." value={query} onChange={e => setQuery(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          {cuisines.map(c => (
            <button key={c} onClick={() => setCuisine(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${cuisine === c ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? <p className="text-gray-400 col-span-3">No restaurants found.</p> : filtered.map(r => (
          <Link to={`/restaurants/${r.id}`} key={r.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 no-underline">
            <img src={r.image} alt={r.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 text-base">{r.name}</h3>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{r.cuisine}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{r.description}</p>
              <div className="flex justify-between text-xs text-gray-400">
                <span>📍 {r.location}</span>
                <span>⭐ {r.rating} · {r.priceRange}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
