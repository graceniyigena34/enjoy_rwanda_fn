import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "../../assets/hero.jpg";

const BASE_URL = "https://enjoy-rwanda-bn-5.onrender.com/api";

interface Restaurant {
  id: number;
  name: string;
  description: string;
  location: string;
  rating?: number;
  reviews?: number;
  hours: string;
  image: string;
  cuisine: string;
  price_range: string;
  deposit: number;
  status: string;
  tables?: any[];
  menu?: any[];
}

const cuisineFilters = ["All", "Rwandan", "International", "Asian", "African", "European"];
type SearchTab = "Shop" | "Restaurants" | "Events";

export default function Home() {
  const [searchTab, setSearchTab] = useState<SearchTab>("Restaurants");
  const [location, setLocation] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    try {
      const res = await fetch(`${BASE_URL}/restaurants`);
      if (!res.ok) {
        console.error("Failed to fetch restaurants: Server error");
        setRestaurants([]);
        return;
      }
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = restaurants.filter(r => cuisineFilter === "All" || r.cuisine === cuisineFilter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTab === "Shop") navigate("/shops");
    else navigate(`/restaurants${location ? `?q=${encodeURIComponent(location)}` : ""}`);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 transition-colors">

      {/* ── Hero ── */}
      <section
        className="relative w-full min-h-[680px] flex items-center justify-center bg-cover bg-top"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Overlay: dark → misty → white */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.44) 48%, rgba(210,220,230,0.65) 75%, rgba(245,247,250,0.94) 88%, #f5f7fa 100%)"
        }} />

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4 pt-16 pb-32 sm:pb-44">
          {/* Heading */}
          <h1 className="text-white font-black leading-tight tracking-tight mb-4"
              style={{ fontSize: "clamp(1.6rem, 5vw, 4.2rem)" }}>
            Experience the Best of{" "}
            <span className="bg-[#1a1a2e] text-white px-2 py-0.5 rounded-lg inline-block">Rwanda</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Shop authentic crafts delivered to your hotel or book the finest restaurants
            with a consumable deposit
          </p>

          {/* Search Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl mx-auto px-4 sm:px-8 pb-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
              {(["Shop", "Restaurants", "Events"] as SearchTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 -mb-px transition-all
                    ${searchTab === tab ? "border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
                >
                  {tab === "Shop" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
                  {tab === "Restaurants" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>}
                  {tab === "Events" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                  {tab}
                </button>
              ))}
            </div>

            {/* Input row */}
            <form className="flex flex-col sm:flex-row gap-3 mb-4" onSubmit={handleSearch}>
              <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-4 bg-white dark:bg-gray-700 focus-within:border-gray-400 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <input
                  type="text"
                  placeholder="Enter your hotel or location..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="flex-1 border-none outline-none text-sm text-gray-800 dark:text-gray-100 py-3.5 bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 bg-[#1a1a2e] text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-[#2d2d4e] transition-colors whitespace-nowrap w-full sm:w-auto">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Search
              </button>
            </form>

            {/* Badges */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span>Fast Delivery</span>
              <span className="w-2 h-2 rounded-full bg-gray-900 inline-block ml-2" />
              <span>20,000 RWF Consumable Deposit</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-2" />
              <span>Authentic Local Products</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Restaurants Section ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        {/* Section header */}
        <div className="flex items-center justify-between gap-6 mb-8 flex-wrap">
          <div>
            <h2 className="text-[2rem] font-black text-gray-900 dark:text-white tracking-tight mb-1">Best Restaurants in Rwanda</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Book a table with 20,000 RWF consumable deposit</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {cuisineFilters.map(c => (
              <button
                key={c}
                onClick={() => setCuisineFilter(c)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all
                  ${cuisineFilter === c ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-800 hover:text-gray-900 dark:hover:text-white"}`}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading restaurants...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No restaurants found.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              {/* Image */}
              <div className="relative h-60 overflow-hidden">
                <img src={r.image} alt={r.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                {r.status === "Open" && <span className="absolute top-3.5 right-3.5 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Open</span>}
                <div className="absolute bottom-3.5 left-4 text-white text-lg font-bold drop-shadow-lg">{r.name}</div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.cuisine}</span>
                  <span className="text-sm text-gray-400 font-medium">{r.price_range}</span>
                </div>
                <div className="flex gap-5 mb-2 flex-wrap">
                  {r.rating && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <strong>{r.rating}</strong>{r.reviews && <span className="text-gray-400">({r.reviews})</span>}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {r.hours}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {r.location}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Reservation deposit: <strong className="text-gray-900 dark:text-white">{r.deposit.toLocaleString()} RWF</strong></span>
                </div>
                <div className="flex gap-3">
                  <Link to={`/restaurants/${r.id}`} className="flex-1 text-center py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white hover:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">View Details</Link>
                  <Link to={`/restaurants/${r.id}`} className="flex-1 text-center py-2.5 bg-[#1a1a2e] !text-white rounded-xl text-sm font-semibold hover:bg-[#2d2d4e] transition-colors no-underline">Book</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}
