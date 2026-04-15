import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const BASE_URL = "https://enjoy-rwanda-bn-5.onrender.com/api";

interface Shop {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  rating?: number;
  image: string;
}

export default function Shops() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState("All");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  async function fetchShops() {
    try {
      const res = await fetch(`${BASE_URL}/shops`);
      if (!res.ok) {
        console.error("Failed to fetch shops");
        setShops([]);
        return;
      }
      const data = await res.json();
      setShops(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = ["All", ...Array.from(new Set(shops.map((s) => s.category)))];
  const filtered = shops.filter((s) => {
    const matchQ = s.name.toLowerCase().includes(query.toLowerCase()) || s.location.toLowerCase().includes(query.toLowerCase());
    return matchQ && (category === "All" || s.category === category);
  });

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Shops in Rwanda</h1>
        <p className="text-gray-500">Browse local products and unique Rwandan goods</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input type="text" placeholder="Search shops..." value={query} onChange={e => setQuery(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${category === c ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading shops...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 col-span-3">No shops found.</p>
        ) : (
          filtered.map(s => (
            <Link to={`/shops/${s.id}`} key={s.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 no-underline">
              <img src={s.image} alt={s.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 text-base">{s.name}</h3>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{s.category}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>📍 {s.location}</span>
                  <span>⭐ {s.rating || 'N/A'}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
