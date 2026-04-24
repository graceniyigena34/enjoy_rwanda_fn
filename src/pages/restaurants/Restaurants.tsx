import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getBusinessProfiles,
  type BusinessProfileRecord,
} from "../../utils/api";
import {
  parseRestaurantHours,
  getStatusBadge,
  displayPriceRange,
} from "../../utils/restaurantUtils";

type BusinessCardRecord = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  hours: string | null;
  image: string | null;
  cuisine: string | null;
  price_range: string | null;
  status: string;
  rating: number;
  reviews: number;
  deposit: number;
};

function toBusinessCard(
  record: BusinessProfileRecord,
  index: number,
): BusinessCardRecord {
  const businessId = record.business_id ?? record.user_id ?? index + 1;
  const hours =
    record.opening_hours && record.closing_hours
      ? `${record.opening_hours} - ${record.closing_hours}`
      : record.opening_hours || record.closing_hours || null;

  return {
    id: businessId,
    name: record.business_name,
    description: record.business_description,
    location: record.location,
    hours,
    image: record.business_profile_image,
    cuisine: record.business_type,
    price_range: null,
    status: record.is_verified ? "Open" : "Pending",
    rating: 4.8,
    reviews: 120,
    deposit: 20000,
  };
}

export default function Restaurants() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [cuisine, setCuisine] = useState("All");
  const [restaurants, setRestaurants] = useState<BusinessCardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch business profiles from API
  useEffect(() => {
    async function loadRestaurants() {
      try {
        setLoading(true);
        const data = await getBusinessProfiles();
        setRestaurants(
          (data || [])
            .filter(
              (item) =>
                (item.business_type ?? "").toLowerCase() === "restaurant",
            )
            .map((item, index) => toBusinessCard(item, index)),
        );
        setError(null);
      } catch (err) {
        console.error("Failed to load businesses:", err);
        setError("Failed to load businesses. Please try again later.");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  // Get unique business types and filter listings
  const cuisines = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          restaurants
            .map((r) => r.cuisine)
            .filter((c): c is string => Boolean(c)),
        ),
      ),
    ],
    [restaurants],
  );

  const filtered = useMemo(
    () =>
      restaurants.filter((r) => {
        const matchQ =
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.location?.toLowerCase().includes(query.toLowerCase());
        return matchQ && (cuisine === "All" || r.cuisine === cuisine);
      }),
    [restaurants, query, cuisine],
  );

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
            Business Listings in Rwanda
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Discover and book verified business listings
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
          Business Listings in Rwanda
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Discover and book verified business listings
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search businesses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
        />
        <div className="flex gap-2 flex-wrap">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                cuisine === c
                  ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-800 dark:hover:border-gray-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse"
            >
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <p className="text-gray-400 col-span-3 text-center py-8">
              No businesses found.
            </p>
          ) : (
            filtered.map((r) => {
              const hours = parseRestaurantHours(r.hours);
              const status = getStatusBadge(r.status);

              return (
                <Link
                  to={`/restaurants/${r.id}`}
                  key={r.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 no-underline group"
                >
                  <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-gray-400">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 7h12M6 11h12M7 15h10M5 19h14M3 21h18" />
                        </svg>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${status.bgColor} ${status.textColor}`}
                      >
                        {status.displayText}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Name and Cuisine */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                        {r.name}
                      </h3>
                      {r.cuisine && (
                        <span className="text-xs bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                          {r.cuisine}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {r.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-snug">
                        {r.description}
                      </p>
                    )}

                    {/* Hours Info */}
                    <div className="mb-3 p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-1">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-slate-500 dark:text-slate-400"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {hours.displayText}
                        </span>
                      </div>
                    </div>

                    {/* Location and Price */}
                    <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gray-400 flex-shrink-0"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-400">
                          {r.location || "Location TBA"}
                        </span>
                      </div>
                      {r.price_range && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-400 flex-shrink-0"
                          >
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">
                            {displayPriceRange(r.price_range)}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
