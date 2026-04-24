import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroBg from "../../assets/hero.jpg";
import {
  BASE_URL,
  getBusinessProfiles,
  type BusinessProfileRecord,
} from "../../utils/api";
import { formatTimeRange } from "../../utils/restaurantUtils";

type SearchTab = "Shop" | "Restaurants";

type HomeRestaurant = {
  id: number;
  name: string;
  location: string;
  weekdayHours: string;
  weekendHours: string;
  workingDays: string[];
  image: string;
  cuisine: string;
  priceRange: string;
  deposit: number;
  status: "Open" | "Closed";
  rating: number;
  reviews: number;
};

const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");
const FALLBACK_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80";

function resolveBusinessImage(image: string | null) {
  if (!image) return FALLBACK_RESTAURANT_IMAGE;
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_ORIGIN}/${image.replace(/^\/+/, "")}`;
}

function inferCuisine(record: BusinessProfileRecord) {
  const source =
    `${record.business_name} ${record.business_description ?? ""}`.toLowerCase();
  if (source.includes("rwand")) return "Rwandan";
  if (
    source.includes("asian") ||
    source.includes("sushi") ||
    source.includes("noodle")
  )
    return "Asian";
  if (source.includes("afric")) return "African";
  if (
    source.includes("europe") ||
    source.includes("ital") ||
    source.includes("french")
  )
    return "European";
  return "International";
}

function normalizeOpeningDays(value: BusinessProfileRecord["opening_days"]) {
  if (Array.isArray(value)) {
    return value.filter(
      (day): day is string => typeof day === "string" && day.trim().length > 0,
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (day): day is string =>
            typeof day === "string" && day.trim().length > 0,
        );
      }
    } catch {
      // fall through to comma parsing
    }

    return trimmed
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean);
  }

  return [];
}

function toHomeRestaurant(
  record: BusinessProfileRecord,
  index: number,
): HomeRestaurant {
  const weekdayHours = formatTimeRange(
    record.opening_hours,
    record.closing_hours,
  );
  const weekendHours = formatTimeRange(
    record.weekend_opening_hours,
    record.weekend_closing_hours,
  );

  return {
    id: record.business_id ?? record.user_id ?? index + 1,
    name: record.business_name,
    location: record.location?.trim() || "Kigali, Rwanda",
    weekdayHours,
    weekendHours:
      weekendHours === "Not set" ? "Same as weekdays" : weekendHours,
    workingDays: normalizeOpeningDays(record.opening_days),
    image: resolveBusinessImage(record.business_profile_image),
    cuisine: inferCuisine(record),
    priceRange: "$$$",
    deposit: 20000,
    status: "Open",
    rating: 4.8,
    reviews: 120,
  };
}

export default function Home() {
  const [searchTab, setSearchTab] = useState<SearchTab>("Restaurants");
  const [location, setLocation] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [restaurants, setRestaurants] = useState<HomeRestaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState("");
  const [bookNowRestaurantId, setBookNowRestaurantId] = useState<number | null>(
    null,
  );
  const [bookNowConsentChecked, setBookNowConsentChecked] = useState(false);
  const navigate = useNavigate();

  const closeBookNowModal = () => {
    setBookNowRestaurantId(null);
    setBookNowConsentChecked(false);
  };

  const openBookNowModal = (restaurantId: number) => {
    setBookNowRestaurantId(restaurantId);
    setBookNowConsentChecked(false);
  };

  const continueToTerms = () => {
    if (!bookNowRestaurantId || !bookNowConsentChecked) return;
    const next = `/restaurants/${bookNowRestaurantId}?entry=book`;
    navigate(`/terms-and-conditions?next=${encodeURIComponent(next)}`);
  };

  useEffect(() => {
    let cancelled = false;

    const loadRestaurants = async () => {
      setRestaurantsLoading(true);
      setRestaurantsError("");

      try {
        const data = await getBusinessProfiles();
        const mapped = data
          .filter(
            (item) =>
              item.is_verified === true &&
              (item.business_type ?? "").toLowerCase() === "restaurant",
          )
          .map((item, index) => toHomeRestaurant(item, index));

        if (!cancelled) {
          setRestaurants(mapped);
        }
      } catch (error) {
        if (!cancelled) {
          setRestaurantsError(
            error instanceof Error
              ? error.message
              : "Failed to load restaurants",
          );
          setRestaurants([]);
        }
      } finally {
        if (!cancelled) {
          setRestaurantsLoading(false);
        }
      }
    };

    void loadRestaurants();

    return () => {
      cancelled = true;
    };
  }, []);

  const cuisineFilters = useMemo(() => {
    const dynamicCuisines = Array.from(
      new Set(restaurants.map((item) => item.cuisine)),
    );
    return ["All", ...dynamicCuisines];
  }, [restaurants]);

  useEffect(() => {
    if (!cuisineFilters.includes(cuisineFilter)) {
      setCuisineFilter("All");
    }
  }, [cuisineFilter, cuisineFilters]);

  const filtered = useMemo(
    () =>
      restaurants.filter(
        (r) => cuisineFilter === "All" || r.cuisine === cuisineFilter,
      ),
    [cuisineFilter, restaurants],
  );

  const featuredHighlights = [
    {
      title: "Curated restaurants",
      description:
        "Verified dining spots with real photos, live details, and flexible booking.",
      icon: "🍽️",
    },
    {
      title: "Authentic local shopping",
      description:
        "Discover handmade products, gifts, and essentials from trusted vendors.",
      icon: "🛍️",
    },
    {
      title: "Fast reservations",
      description:
        "Book in a few taps and secure your table with a consumable deposit.",
      icon: "⚡",
    },
    {
      title: "Made for visitors",
      description:
        "Built to help travelers explore Rwanda with less friction and more confidence.",
      icon: "🇷🇼",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Choose where to go",
      description:
        "Search restaurants or shops by location and browse verified listings.",
    },
    {
      step: "02",
      title: "Review the details",
      description:
        "Check photos, hours, ratings, deposits, and availability before you book.",
    },
    {
      step: "03",
      title: "Reserve or shop",
      description:
        "Confirm your reservation or start shopping and pay when you are ready.",
    },
  ];

  const travelerTips = [
    "Plan dinner early on weekends for better availability.",
    "Use the restaurant filters to find the cuisine that fits your mood.",
    "Open the shop section for gifts, essentials, and local products.",
    "Reserve ahead if you are traveling with a group or family.",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTab === "Shop") navigate("/shops");
    else
      navigate(
        `/restaurants${location ? `?q=${encodeURIComponent(location)}` : ""}`,
      );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 transition-colors">
      {/* ── Hero ── */}
      <section
        className="relative w-full min-h-[680px] flex items-center justify-center bg-cover bg-top"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Overlay: dark → misty → white */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.44) 48%, rgba(210,220,230,0.65) 75%, rgba(245,247,250,0.94) 88%, #f5f7fa 100%)",
          }}
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4 pt-16 pb-32 sm:pb-44">
          {/* Heading */}
          <h1
            className="text-white font-black leading-tight tracking-tight mb-4"
            style={{ fontSize: "clamp(1.6rem, 5vw, 4.2rem)" }}
          >
            Experience the Best of{" "}
            <span className="bg-[#1a1a2e] text-white px-2 py-0.5 rounded-lg inline-block">
              Rwanda
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Shop authentic crafts delivered to your hotel or book the finest
            restaurants with a consumable deposit
          </p>

          {/* Search Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl mx-auto px-4 sm:px-8 pb-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
              {(["Shop", "Restaurants"] as SearchTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 -mb-px transition-all
                    ${searchTab === tab ? "border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
                >
                  {tab === "Shop" && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                  )}
                  {tab === "Restaurants" && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                      <path d="M7 2v20" />
                      <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                    </svg>
                  )}
                  {tab}
                </button>
              ))}
            </div>

            {/* Input row */}
            <form
              className="flex flex-col sm:flex-row gap-3 mb-4"
              onSubmit={handleSearch}
            >
              <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-4 bg-white dark:bg-gray-700 focus-within:border-gray-400 transition-colors">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#bbb"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter your hotel or location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 border-none outline-none text-sm text-gray-800 dark:text-gray-100 py-3.5 bg-transparent placeholder-gray-300 dark:placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-[#1a1a2e] text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-[#2d2d4e] transition-colors whitespace-nowrap w-full sm:w-auto"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
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

            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/restaurants"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a1a2e] px-6 py-3 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-gray-50 dark:border-white dark:text-white dark:hover:bg-white/5"
              >
                Explore Restaurants
              </Link>
              <Link
                to="/shops"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1a1a2e] px-6 py-3 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-gray-50 dark:border-white dark:text-white dark:hover:bg-white/5"
              >
                Explore Shops
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Restaurants Section ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        {/* Section header */}
        <div className="flex items-center justify-between gap-6 mb-8 flex-wrap">
          <div>
            <h2 className="text-[2rem] font-black text-gray-900 dark:text-white tracking-tight mb-1">
              Best Restaurants in Rwanda
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Book a table with 20,000 RWF consumable deposit
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {cuisineFilters.map((c) => (
              <button
                key={c}
                onClick={() => setCuisineFilter(c)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all
                  ${cuisineFilter === c ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-800 hover:text-gray-900 dark:hover:text-white"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {restaurantsLoading && (
            <div className="col-span-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
              Loading restaurants...
            </div>
          )}

          {!restaurantsLoading && restaurantsError && (
            <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/30 dark:text-red-300">
              {restaurantsError}
            </div>
          )}

          {!restaurantsLoading &&
            !restaurantsError &&
            filtered.length === 0 && (
              <div className="col-span-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                No restaurants available right now.
              </div>
            )}

          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              {/* Image */}
              <div className="relative h-60 overflow-hidden">
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {r.status === "Open" && (
                  <span className="absolute top-3.5 right-3.5 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Open
                  </span>
                )}
                <div className="absolute bottom-3.5 left-4 text-white text-lg font-bold drop-shadow-lg">
                  {r.name}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {r.cuisine}
                  </span>
                  <span className="text-sm text-gray-400 font-medium">
                    {r.priceRange}
                  </span>
                </div>
                <div className="flex gap-5 mb-2 flex-wrap">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#f59e0b"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <strong>{r.rating}</strong>
                    <span className="text-gray-400">({r.reviews})</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#888"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {r.location}
                </div>
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="font-semibold">Weekdays:</span>
                    <span>{r.weekdayHours}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 mb-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="font-semibold">Weekends:</span>
                    <span>{r.weekendHours}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      Working days:
                    </span>
                    {r.workingDays.length > 0 ? (
                      r.workingDays.map((day) => (
                        <span
                          key={`${r.id}-${day}`}
                          className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-gray-200 dark:ring-slate-600"
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Not set
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-3">
                  <Link
                    to={`/restaurants/${r.id}?entry=details`}
                    className="group flex-1 rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-2.5 text-center text-sm font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:border-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/70 dark:text-white dark:hover:border-slate-300 dark:hover:bg-slate-700"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="transition-transform group-hover:scale-110"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      View Details
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openBookNowModal(r.id)}
                    className="group flex-1 rounded-xl bg-gradient-to-r from-[#1a1a2e] via-[#252547] to-[#2f2f55] px-3 py-2.5 text-center text-sm font-semibold !text-white shadow-[0_10px_25px_rgba(26,26,46,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(26,26,46,0.42)] no-underline"
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Book Now
                    </span>
                  </button>
                </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    View Details opens gallery and menu. Book Now jumps straight to reservation.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Highlights ── */}
      {bookNowRestaurantId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close terms consent dialog"
            onClick={closeBookNowModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          />
          <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.35)]">
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2f2f55] px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                Before You Continue
              </p>
              <h2 className="mt-1 text-2xl font-black">Terms & Conditions Required</h2>
              <p className="mt-2 text-sm text-slate-100">
                To continue with booking, please review and accept Enjoy Rwanda Terms and Conditions.
              </p>
            </div>
            <div className="space-y-5 px-6 py-6">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={bookNowConsentChecked}
                  onChange={(event) => setBookNowConsentChecked(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1a1a2e] focus:ring-[#1a1a2e]"
                />
                <span>
                  I agree to review and accept the Terms and Conditions before confirming my reservation.
                </span>
              </label>
              <p className="text-xs text-slate-500">
                You will be redirected to the full Terms page. If you do not agree there, you will return to the home page.
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeBookNowModal}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={continueToTerms}
                  disabled={!bookNowConsentChecked}
                  className="rounded-xl bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d2d4e] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Continue
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <h2 className="text-[2rem] font-black text-gray-900 dark:text-white tracking-tight mb-1">
              How Enjoy Rwanda Works
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A simple flow for visitors, locals, and business owners.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {howItWorks.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a1a2e] text-white font-black mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rwanda Experience ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-[2rem] font-black text-gray-900 dark:text-white tracking-tight mb-3">
              More than a booking site
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-7 mb-6">
              Enjoy Rwanda is designed to help you explore, reserve, and buy
              with confidence. We combine restaurants, shops, and local travel
              guidance in one place so you spend less time searching and more
              time enjoying the experience.
            </p>
            <div className="space-y-3">
              {travelerTips.map((tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-3 rounded-2xl bg-gray-50 dark:bg-gray-700/60 px-4 py-3"
                >
                  <span className="mt-0.5 text-[#1a1a2e] dark:text-white">
                    •
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e] p-6 sm:p-8 shadow-xl text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-3">
              Missing features added
            </p>
            <h3 className="text-2xl font-black mb-4">
              Everything you expect in one place
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Verified listings", `${restaurants.length}+`],
                [
                  "Open today",
                  `${restaurants.filter((r) => r.status === "Open").length}+`,
                ],
                ["Deposit booking", "Available"],
                ["Shop catalog", "Live"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60 mb-1">
                    {label}
                  </p>
                  <p className="text-lg font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 pb-16">
        <div className="rounded-[2rem] border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-[2rem] font-black text-gray-900 dark:text-white tracking-tight mb-2">
                Ready to explore Rwanda?
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-7">
                Use the search above to find restaurants, reserve a table, or
                explore shops. More categories and experiences can be added here
                later without changing the current landing page design.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/restaurants"
                className="rounded-xl border-2 border-[#1a1a2e] px-6 py-3 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-gray-50 dark:border-white dark:text-white dark:hover:bg-white/5"
              >
                Explore Restaurants
              </Link>
              <Link
                to="/shops"
                className="rounded-xl border-2 border-[#1a1a2e] px-6 py-3 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-gray-50 dark:border-white dark:text-white dark:hover:bg-white/5"
              >
                Explore Shops
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
