import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { restaurants } from "../../data/mockData";
import {
  createBooking,
  getMenuItems,
  getTableConfigurations,
  getBusinessProfiles,
  type MenuItemRecord,
  type TableConfigRecord,
} from "../../utils/api";
import PhoneNumberInput, {
  splitInternationalPhone,
} from "../../components/forms/PhoneNumberInput";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
};

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const businessId = Number(id);

  const restaurant = restaurants.find((r) => r.id === businessId);

  const [activeTab, setActiveTab] = useState<"menu" | "book">("book");
  const [tableStep, setTableStep] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Table search state
  const [tableSearch, setTableSearch] = useState("");
  const [tableConfigs, setTableConfigs] = useState<TableConfigRecord[]>([]);
  const [matchedTable, setMatchedTable] = useState<TableConfigRecord | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [menuCategory, setMenuCategory] = useState<"All" | "Food" | "Drinks">(
    "All",
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [orderList, setOrderList] = useState<MenuItem[]>([]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Fetch ALL table configs from ALL businesses in DB
  // Visitor types a number → matches against real DB data
  useEffect(() => {
    void getBusinessProfiles()
      .then(async (profiles) => {
        // Fetch table configs for all businesses and merge
        const all: TableConfigRecord[] = [];
        for (const p of profiles) {
          if (!p.business_id) continue;
          try {
            const data = await getTableConfigurations(Number(p.business_id));
            all.push(...data);
          } catch {
            // skip failed fetches
          }
        }
        if (all.length > 0) setTableConfigs(all);
      })
      .catch(() => {});
  }, []);

  // Auto-match price when visitor types - exact match first, then starts-with
  useEffect(() => {
    if (!tableSearch.trim()) {
      setMatchedTable(null);
      return;
    }
    const val = tableSearch.trim().toLowerCase();
    // 1. Exact match
    let found = tableConfigs.find(
      (t) => t.table_of_people.toLowerCase() === val,
    );
    // 2. Starts with
    if (!found)
      found = tableConfigs.find((t) =>
        t.table_of_people.toLowerCase().startsWith(val),
      );
    setMatchedTable(found ?? null);
  }, [tableSearch, tableConfigs]);

  if (!restaurant)
    return (
      <div className="p-10 text-center">
        Restaurant not found.{" "}
        <Link to="/restaurants" className="text-blue-600 underline">
          Go back
        </Link>
      </div>
    );

  const parsePeopleCount = (value: string) => {
    const trimmed = value.trim();
    const direct = Number(trimmed);
    if (Number.isFinite(direct) && direct > 0) return direct;

    const firstRangePart = Number(trimmed.split("-")[0]);
    if (Number.isFinite(firstRangePart) && firstRangePart > 0) {
      return firstRangePart;
    }

    return 1;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = guestName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const parsedPhone = splitInternationalPhone(telephone);
    const normalizedPhone = parsedPhone.localNumber;
    const normalizedPhoneWithCode = normalizedPhone
      ? `${parsedPhone.countryCode}${normalizedPhone}`
      : "";
    const peopleCount = matchedTable
      ? parsePeopleCount(String(matchedTable.table_of_people))
      : parsePeopleCount(tableSearch);

    if (
      !bookingDate ||
      !bookingTime ||
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhoneWithCode
    ) {
      setBookingError("Please fill in all required booking fields.");
      return;
    }

    setBookingSubmitting(true);
    setBookingError("");
    try {
      const created = await createBooking({
        tableId: matchedTable?.id ?? null,
        visitorName: normalizedName,
        fullnames: normalizedName,
        email: normalizedEmail,
        telephone: normalizedPhoneWithCode,
        numberOfPeople: peopleCount,
        specialRequest: specialRequests.trim(),
        date: bookingDate,
        time: bookingTime,
        businessId: Number(restaurant.id),
      });

      localStorage.setItem(
        "enjoy-rwanda.pendingBookingContext",
        JSON.stringify({
          bookingId: created.id,
          email: normalizedEmail,
          restaurantName: restaurant.name,
          createdAt: Date.now(),
        }),
      );

      navigate("/booking-confirming", {
        state: {
          bookingId: created.id,
          email: normalizedEmail,
          restaurantName: restaurant.name,
        },
      });
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Failed to create booking.",
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const inferMenuCategory = (row: MenuItemRecord): "Food" | "Drinks" => {
    const text = `${row.name} ${row.description ?? ""}`.toLowerCase();
    const drinkKeywords = [
      "juice",
      "water",
      "soda",
      "beer",
      "wine",
      "tea",
      "coffee",
      "cocktail",
      "smoothie",
    ];
    return drinkKeywords.some((keyword) => text.includes(keyword))
      ? "Drinks"
      : "Food";
  };

  useEffect(() => {
    if (!Number.isFinite(businessId) || businessId <= 0) {
      setMenuItems([]);
      setMenuError("Invalid restaurant id.");
      return;
    }
    let active = true;
    const loadMenu = async () => {
      setMenuLoading(true);
      setMenuError("");
      try {
        const rows = await getMenuItems({ businessId });
        if (!active) return;
        setMenuItems(
          rows.map((row) => ({
            id: row.id,
            name: row.name,
            price: Number(row.price),
            description: row.description?.trim() || "No description available.",
            category: inferMenuCategory(row),
            image: row.imageurl || undefined,
          })),
        );
      } catch (error) {
        if (!active) return;
        setMenuError(
          error instanceof Error
            ? error.message
            : "Failed to load restaurant menu.",
        );
        setMenuItems([]);
      } finally {
        if (active) setMenuLoading(false);
      }
    };
    void loadMenu();
    return () => {
      active = false;
    };
  }, [businessId]);

  const handleAddToOrder = (item: MenuItem) =>
    setOrderList((prev) => [...prev, item]);
  const handleRemoveFromOrder = (index: number) =>
    setOrderList((prev) => prev.filter((_, i) => i !== index));
  const orderTotal = orderList.reduce((sum, item) => sum + item.price, 0);

  const visibleItems = useMemo(
    () =>
      menuItems.filter(
        (i) =>
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [menuItems, searchTerm],
  );

  const foodItems = visibleItems.filter((i) => i.category === "Food");
  const drinkItems = visibleItems.filter((i) => i.category === "Drinks");
  const totalVisible = foodItems.length + drinkItems.length;

  const MenuCard = ({
    item,
    priceColor,
  }: {
    item: MenuItem;
    priceColor: string;
  }) => (
    <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:shadow-sm hover:border-gray-200 transition-all">
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-xl shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
          {item.description}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`font-bold text-sm whitespace-nowrap ${priceColor}`}>
          {item.price.toLocaleString()} RWF
        </span>
        <button
          onClick={() => handleAddToOrder(item)}
          className="bg-[#1a1a2e] !text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2d2d4e] transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full md:w-72 h-48 sm:h-56 object-cover rounded-2xl"
        />
        <div className="flex flex-col justify-center">
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium w-fit mb-2">
            {restaurant.cuisine}
          </span>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {restaurant.name}
          </h1>
          <p className="text-gray-500 mb-3">{restaurant.description}</p>
          <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
            <span>📍 {restaurant.location}</span>
            <span>⭐ {restaurant.rating}</span>
            <span>💰 {restaurant.priceRange}</span>
            <span>🕐 {restaurant.hours}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {(["book", "menu"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}
          >
            {t === "menu" ? "🍽️ View Menu" : "📅 Book"}
          </button>
        ))}
      </div>

      {/* BOOKING */}
      {activeTab === "book" && (
        <div>
          {!tableStep ? (
            /* Step 1: Search for table size → price shows automatically */
            <div className="max-w-xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  Reserve a Table
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the number of people and the reservation price will
                  appear automatically.
                </p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Number of People
                </label>
                <select
                  value={tableSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTableSearch(val);
                    setMatchedTable(tableConfigs.find((t) => t.table_of_people === val) ?? null);
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#1a1a2e] bg-white cursor-pointer"
                >
                  <option value="">-- Select number of people --</option>
                  {tableConfigs.map((t) => (
                    <option key={t.id} value={t.table_of_people}>
                      {t.table_of_people}
                    </option>
                  ))}
                </select>
              </div>

              {tableSearch.trim() && (
                <div
                  className={`rounded-2xl px-5 py-4 mb-5 border ${matchedTable ? "border-[#1a1a2e]/20 bg-[#1a1a2e]/5" : "border-gray-200 bg-gray-50"}`}
                >
                  {matchedTable ? (
                    <>
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                        Reservation Price
                      </p>
                      <p className="text-3xl font-black text-[#1a1a2e]">
                        {Number(matchedTable.price).toLocaleString()} RWF
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Table of {matchedTable.table_of_people} people
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No table found for <strong>{tableSearch}</strong>.
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={!matchedTable}
                onClick={() => {
                  setTableStep(true);
                }}
                className="w-full bg-[#1a1a2e] !text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#2d2d4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Booking &rarr;
              </button>
            </div>
          ) : (
            /* Step 2: Booking form */
            <div>
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#1a1a2e]/15 bg-[#1a1a2e]/5 px-5 py-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Reservation
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    Table of {matchedTable?.table_of_people} &mdash;{" "}
                    {Number(matchedTable?.price).toLocaleString()} RWF
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTableStep(false)}
                  className="text-xs text-[#1a1a2e] font-semibold underline underline-offset-2"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleBooking} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Telephone
                    </label>
                    <PhoneNumberInput
                      value={telephone}
                      onChange={setTelephone}
                      required
                      defaultCountryIso2="RW"
                      placeholder="7XXXXXXXX"
                      className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Allergies, dietary requirements, special occasions..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
                  />
                </div>
                {bookingError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {bookingError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full bg-[#1a1a2e] !text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingSubmitting ? "Booking..." : "Book Now"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* VIEW MENU */}
      {activeTab === "menu" && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                type="text"
                placeholder="Search food or drinks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              />
              <div className="flex gap-2">
                {(["All", "Food", "Drinks"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMenuCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${menuCategory === cat ? "bg-[#1a1a2e] !text-white border-[#1a1a2e]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"}`}
                  >
                    {cat === "Food"
                      ? "🍛 Food"
                      : cat === "Drinks"
                        ? "🥤 Drinks"
                        : "🍽️ All"}
                  </button>
                ))}
              </div>
            </div>

            {!menuLoading && !menuError && totalVisible === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">
                No items found.
              </p>
            )}
            {menuLoading && (
              <p className="text-gray-500 text-sm text-center py-8">
                Loading menu...
              </p>
            )}
            {!menuLoading && menuError && (
              <p className="text-red-600 text-sm text-center py-8">
                {menuError}
              </p>
            )}

            {(menuCategory === "All" || menuCategory === "Food") &&
              foodItems.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span>🍛</span>
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">
                      Food
                    </h3>
                    <div className="flex-1 border-t border-dashed border-gray-200" />
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {foodItems.length} items
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {foodItems.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        priceColor="text-orange-700"
                      />
                    ))}
                  </div>
                </div>
              )}

            {(menuCategory === "All" || menuCategory === "Drinks") &&
              drinkItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span>🥤</span>
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">
                      Drinks
                    </h3>
                    <div className="flex-1 border-t border-dashed border-gray-200" />
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {drinkItems.length} items
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {drinkItems.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        priceColor="text-blue-700"
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-72 shrink-0 order-first lg:order-last">
            <div className="sticky top-24 border border-gray-200 rounded-2xl p-5 bg-gray-50">
              <h2 className="font-bold text-gray-900 mb-4">
                🧾 Your Pre-Order
              </h2>
              {orderList.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No items added yet.
                  <br />
                  <span className="text-xs">Click + Add on any item</span>
                </p>
              ) : (
                <>
                  <ul className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
                    {orderList.map((item, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-start text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span className="font-semibold text-gray-900 text-xs">
                            {item.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleRemoveFromOrder(i)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 mb-4">
                    <span>Total</span>
                    <span>{orderTotal.toLocaleString()} RWF</span>
                  </div>
                </>
              )}
              <button
                type="button"
                disabled
                className="w-full bg-gray-400 !text-white py-3 rounded-xl font-semibold cursor-not-allowed text-sm"
              >
                Book table from the Book tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
