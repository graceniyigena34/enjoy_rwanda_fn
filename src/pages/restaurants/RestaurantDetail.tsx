import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  createBooking,
  getBusinessProfiles,
  getMenuItems,
  getTableConfigurations,
  type MenuItemRecord,
  type TableConfigRecord,
  type BusinessProfileRecord,
} from "../../utils/api";
import PhoneNumberInput, {
  splitInternationalPhone,
} from "../../components/forms/PhoneNumberInput";
import { formatTimeRange } from "../../utils/restaurantUtils";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
};

type BusinessDetailRecord = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  weekdayHours: string;
  weekendHours: string;
  workingDays: string[];
  image: string | null;
  cuisine: string | null;
  price_range: string | null;
  status: string;
};

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
      // Fall back to comma-separated values.
    }

    return trimmed
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean);
  }

  return [];
}

function toBusinessDetail(
  record: BusinessProfileRecord,
  fallbackId: number,
): BusinessDetailRecord {
  const weekdayHours = formatTimeRange(
    record.opening_hours,
    record.closing_hours,
  );
  const weekendHours = formatTimeRange(
    record.weekend_opening_hours,
    record.weekend_closing_hours,
  );

  return {
    id: record.business_id ?? fallbackId,
    name: record.business_name,
    description: record.business_description,
    location: record.location,
    weekdayHours,
    weekendHours:
      weekendHours === "Not set" ? "Same as weekdays" : weekendHours,
    workingDays: normalizeOpeningDays(record.opening_days),
    image: record.business_profile_image,
    cuisine: record.business_type,
    price_range: null,
    status: record.is_verified ? "Open" : "Pending",
  };
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = Number(id);
  const initialPeopleCount = searchParams.get("people")?.trim() ?? "";
  const initialDate = searchParams.get("date")?.trim() ?? "";
  const initialTime = searchParams.get("time")?.trim() ?? "";

  const [restaurant, setRestaurant] = useState<BusinessDetailRecord | null>(
    null,
  );
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);

  // Fetch business profile data from API
  useEffect(() => {
    let active = true;
    const loadRestaurant = async () => {
      if (!Number.isFinite(businessId) || businessId <= 0) {
        setRestaurantError("Invalid business id.");
        setRestaurantLoading(false);
        return;
      }

      try {
        setRestaurantLoading(true);
        const data = await getBusinessProfiles();
        const matched = (data || []).find(
          (item) => Number(item.business_id ?? item.user_id) === businessId,
        );
        if (active) {
          if (matched) {
            setRestaurant(toBusinessDetail(matched, businessId));
            setRestaurantError(null);
          } else {
            setRestaurant(null);
            setRestaurantError("Business not found.");
          }
        }
      } catch (error) {
        if (active) {
          setRestaurant(null);
          setRestaurantError(
            error instanceof Error ? error.message : "Failed to load business.",
          );
        }
      } finally {
        if (active) {
          setRestaurantLoading(false);
        }
      }
    };

    void loadRestaurant();
    return () => {
      active = false;
    };
  }, [businessId]);

  const [activeTab, setActiveTab] = useState<"menu" | "book">("book");
  const [tableStep, setTableStep] = useState(false);
  const [showMenuPrompt, setShowMenuPrompt] = useState(false);
  const [menuSelectionStep, setMenuSelectionStep] = useState(false);
  const [bookingDate, setBookingDate] = useState(initialDate);
  const [bookingTime, setBookingTime] = useState(initialTime);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Table search state
  const [tableSearch, setTableSearch] = useState(initialPeopleCount);
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
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");
  const [tableOptionQuery, setTableOptionQuery] = useState("");

  const parsePeopleCount = (value: string) => {
    const trimmed = value.trim();
    const direct = Number(trimmed);
    if (Number.isFinite(direct) && direct > 0) return direct;

    const firstRangePart = Number(trimmed.split("-")[0]);
    if (Number.isFinite(firstRangePart) && firstRangePart > 0) {
      return firstRangePart;
    }

    const firstNumberMatch = trimmed.match(/\d+/);
    if (firstNumberMatch) {
      const parsed = Number(firstNumberMatch[0]);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    return 1;
  };

  const formatReservationAmount = (value: number) => {
    if (!Number.isFinite(value)) return "0 RWF";
    const compact = new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
    return `${compact} RWF`;
  };

  // Fetch table configs from DB for this restaurant only.
  useEffect(() => {
    if (!Number.isFinite(businessId) || businessId <= 0) {
      setTableConfigs([]);
      setTableError("Invalid restaurant id.");
      return;
    }

    let active = true;
    const loadTables = async () => {
      setTableLoading(true);
      setTableError("");
      try {
        const rows = await getTableConfigurations(businessId);
        if (!active) return;
        setTableConfigs(rows);
      } catch (error) {
        if (!active) return;
        setTableConfigs([]);
        setTableError(
          error instanceof Error
            ? error.message
            : "Failed to load table configurations.",
        );
      } finally {
        if (active) setTableLoading(false);
      }
    };

    void loadTables();
    return () => {
      active = false;
    };
  }, [businessId]);

  // Match selected people count to DB table capacity using range fallback.
  // Example: selecting 3 will pick a 4-seat table when 3 is unavailable.
  useEffect(() => {
    if (!tableSearch.trim()) {
      setMatchedTable(null);
      return;
    }
    const selectedCount = Number(tableSearch.trim());
    const sortedTables = [...tableConfigs].sort(
      (a, b) =>
        parsePeopleCount(String(a.table_of_people)) -
        parsePeopleCount(String(b.table_of_people)),
    );

    let found = sortedTables.find(
      (t) => parsePeopleCount(String(t.table_of_people)) === selectedCount,
    );

    if (!found) {
      found = sortedTables.find(
        (t) => parsePeopleCount(String(t.table_of_people)) >= selectedCount,
      );
    }

    if (!found) {
      found = sortedTables[sortedTables.length - 1];
    }

    setMatchedTable(found ?? null);
  }, [tableSearch, tableConfigs]);

  const peopleOptions = useMemo(() => {
    const capacities = tableConfigs
      .map((tableConfig) =>
        parsePeopleCount(String(tableConfig.table_of_people)),
      )
      .filter((capacity) => Number.isFinite(capacity) && capacity > 0);
    const maxCapacity = capacities.length > 0 ? Math.max(...capacities) : 12;
    const upperLimit = Math.max(12, maxCapacity);
    return Array.from({ length: upperLimit - 1 }, (_, index) => index + 2);
  }, [tableConfigs]);

  const filteredPeopleOptions = useMemo(() => {
    const query = tableOptionQuery.trim().toLowerCase();
    if (!query) return peopleOptions;

    const byCount = peopleOptions.filter((count) =>
      String(count).includes(query),
    );
    if (byCount.length > 0) return byCount;

    return peopleOptions.filter((count) => {
      const matchingTables = tableConfigs.filter(
        (tableConfig) =>
          parsePeopleCount(String(tableConfig.table_of_people)) === count,
      );

      return matchingTables.some((tableConfig) => {
        const peopleText = String(
          parsePeopleCount(String(tableConfig.table_of_people)),
        );
        const priceText = String(Math.round(Number(tableConfig.price)));
        return peopleText.includes(query) || priceText.includes(query);
      });
    });
  }, [peopleOptions, tableOptionQuery]);

  useEffect(() => {
    const query = tableOptionQuery.trim().toLowerCase();
    if (!query || tableConfigs.length === 0) return;

    const numericQuery = Number(query);
    if (Number.isFinite(numericQuery) && numericQuery > 0) {
      setTableSearch(String(Math.trunc(numericQuery)));
      return;
    }

    const sortedTables = [...tableConfigs].sort(
      (a, b) =>
        parsePeopleCount(String(a.table_of_people)) -
        parsePeopleCount(String(b.table_of_people)),
    );

    const matchedByPrice = sortedTables.find((tableConfig) =>
      String(Math.round(Number(tableConfig.price))).includes(query),
    );

    const matchedBySize = sortedTables.find((tableConfig) => {
      const peopleText = String(
        parsePeopleCount(String(tableConfig.table_of_people)),
      );
      return peopleText.includes(query);
    });

    const matched = matchedByPrice ?? matchedBySize;
    if (!matched) return;

    const peopleCount = parsePeopleCount(String(matched.table_of_people));
    setTableSearch(String(peopleCount));
  }, [tableConfigs, tableOptionQuery]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      setBookingError("Business details are still loading.");
      return;
    }
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

    // If we're in menu selection step, submit the booking with menu items
    if (menuSelectionStep) {
      setBookingSubmitting(true);
      setBookingError("");
      try {
        // Use the first menu item's ID if any (backend expects single menu_id)
        const menuId = orderList.length > 0 ? orderList[0].id : undefined;

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
          menuId,
        });

        const reservationAmount = Number(matchedTable?.price) || 0;

        localStorage.setItem(
          "enjoy-rwanda.pendingBookingContext",
          JSON.stringify({
            bookingId: created.id,
            email: normalizedEmail,
            restaurantName: restaurant.name,
            reservationAmount,
            menuItems: orderList.map((item) => ({
              name: item.name,
              price: item.price,
            })),
            menuTotal: orderTotal,
            numberOfPeople: peopleCount,
            date: bookingDate,
            time: bookingTime,
            createdAt: Date.now(),
          }),
        );

        navigate("/booking-confirming", {
          state: {
            bookingId: created.id,
            email: normalizedEmail,
            restaurantName: restaurant.name,
            reservationAmount,
            menuItems: orderList.map((item) => ({
              name: item.name,
              price: item.price,
            })),
            menuTotal: orderTotal,
            numberOfPeople: peopleCount,
            date: bookingDate,
            time: bookingTime,
          },
        });
      } catch (error) {
        setBookingError(
          error instanceof Error ? error.message : "Failed to create booking.",
        );
      } finally {
        setBookingSubmitting(false);
      }
      return;
    }

    // First submission: show menu prompt
    setShowMenuPrompt(true);
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

  if (restaurantLoading) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a2e] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading business details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant || restaurantError) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Business not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {restaurantError ||
              "The business you're looking for doesn't exist or is no longer available."}
          </p>
          <Link
            to="/restaurants"
            className="inline-block bg-[#1a1a2e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d2d4e] transition-colors"
          >
            Back to Businesses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full md:w-72 h-48 sm:h-56 object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full md:w-72 h-48 sm:h-56 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-400 dark:text-slate-500"
            >
              <path d="M8 7h12M6 11h12M7 15h10M5 19h14M3 21h18" />
            </svg>
          </div>
        )}
        <div className="flex flex-col justify-center">
          <span className="text-xs bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full font-medium w-fit mb-2">
            {restaurant.cuisine || "Business"}
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {restaurant.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {restaurant.description}
          </p>
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap mb-3">
            <span>📍 {restaurant.location || "Location TBA"}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              <span className="font-semibold">Weekdays:</span>{" "}
              {restaurant.weekdayHours}
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">
              <span className="font-semibold">Weekends:</span>{" "}
              {restaurant.weekendHours}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Working days:
              </span>
              {restaurant.workingDays.length > 0 ? (
                restaurant.workingDays.map((day) => (
                  <span
                    key={`${restaurant.id}-${day}`}
                    className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600"
                  >
                    {day}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Not set
                </span>
              )}
            </div>
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
            <div className="max-w-[260px] sm:max-w-sm mx-auto px-0 sm:px-0 border border-gray-200 rounded-xl bg-white p-2 sm:p-0 sm:border-0 sm:bg-transparent">
              <div className="mb-3 sm:mb-6 text-left">
                <h2 className="text-base sm:text-xl font-black text-gray-900">
                  Reserve a Table
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-tight">
                  Enter the number of people and the reservation price will
                  appear automatically.
                </p>
              </div>

              <div className="mb-2 sm:mb-3">
                <label className="text-[11px] sm:text-xs font-medium text-gray-700 block mb-1">
                  Number of People
                </label>
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <div className="w-full flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 focus-within:border-[#1a1a2e]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-400 shrink-0"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={tableOptionQuery}
                      onChange={(e) => setTableOptionQuery(e.target.value)}
                      placeholder="Search"
                      className="w-full border-none outline-none bg-transparent text-[11px] sm:text-xs text-gray-900 placeholder:text-gray-400 p-0"
                    />
                  </div>
                  <select
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                    }}
                    disabled={tableLoading || tableConfigs.length === 0}
                    className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold outline-none focus:border-[#1a1a2e] bg-white cursor-pointer"
                  >
                    <option value="">
                      {tableLoading ? "Loading..." : "Select number of people"}
                    </option>
                    {filteredPeopleOptions.map((count) => (
                      <option key={count} value={String(count)}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>
                {!tableLoading &&
                  !tableError &&
                  filteredPeopleOptions.length === 0 && (
                    <p className="mt-1 text-[10px] text-gray-400 text-left">
                      No table size matches your search.
                    </p>
                  )}
              </div>

              {!tableLoading && tableError && (
                <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700">
                  {tableError}
                </div>
              )}

              {tableSearch.trim() && (
                <div
                  className={`w-full rounded-md px-2 py-1.5 mb-2 sm:mb-3 border ${matchedTable ? "border-[#1a1a2e]/20 bg-[#1a1a2e]/5" : "border-gray-200 bg-gray-50"}`}
                >
                  {matchedTable ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400">
                        Reservation Price
                      </p>
                      <p className="text-xs sm:text-sm font-black text-[#1a1a2e] leading-tight whitespace-nowrap">
                        {formatReservationAmount(Number(matchedTable.price))}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] text-gray-400">
                      No table found for <strong>{tableSearch}</strong>.
                    </p>
                  )}
                </div>
              )}

              {matchedTable && (
                <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[10px] sm:text-[11px] text-amber-800">
                  Non-consumable. No refund.
                </div>
              )}

              <button
                type="button"
                disabled={!matchedTable}
                onClick={() => {
                  setTableStep(true);
                }}
                className="w-[125px] sm:w-[155px] mx-auto block bg-[#1a1a2e] !text-white py-1.5 rounded-md font-bold text-[10px] sm:text-[11px] hover:bg-[#2d2d4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Continue to Booking &rarr;
              </button>
            </div>
          ) : (
            /* Step 2: Booking form */
            <div className="max-w-[320px] sm:max-w-2xl mx-auto border border-gray-200 rounded-xl bg-white p-3 sm:p-5">
              <div className="mb-4 w-full mx-auto flex items-center justify-between gap-2 rounded-lg border border-[#1a1a2e]/15 bg-[#1a1a2e]/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    Reservation Price
                  </p>
                  <p className="font-bold text-gray-900 text-sm leading-snug whitespace-nowrap">
                    {formatReservationAmount(Number(matchedTable?.price))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTableStep(false)}
                  className="text-xs text-[#1a1a2e] font-semibold underline underline-offset-2 self-start sm:self-auto"
                >
                  Change
                </button>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
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
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
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
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400"
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
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
                  />
                </div>
                {bookingError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {bookingError}
                  </div>
                )}
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Non-consumable. No refund.
                </div>

                {/* Menu Prompt - Show after guest info is filled */}
                {showMenuPrompt && !menuSelectionStep && (
                  <div className="mt-4 p-4 rounded-xl border-2 border-orange-200 bg-orange-50">
                    <div className="text-center mb-4">
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        🍽️ Add Menu Items?
                      </p>
                      <p className="text-sm text-gray-600">
                        Would you like to add food or drinks to your
                        reservation?
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuSelectionStep(true);
                          setActiveTab("menu");
                        }}
                        className="flex-1 bg-[#1a1a2e] !text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2d2d4e] transition-colors"
                      >
                        Yes, Add Menu
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          // Proceed without menu items
                          setBookingSubmitting(true);
                          setBookingError("");
                          try {
                            const normalizedName = guestName.trim();
                            const normalizedEmail = email.trim().toLowerCase();
                            const parsedPhone =
                              splitInternationalPhone(telephone);
                            const normalizedPhone = parsedPhone.localNumber;
                            const normalizedPhoneWithCode = normalizedPhone
                              ? `${parsedPhone.countryCode}${normalizedPhone}`
                              : "";
                            const peopleCount = matchedTable
                              ? parsePeopleCount(
                                  String(matchedTable.table_of_people),
                                )
                              : parsePeopleCount(tableSearch);

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

                            const reservationAmount =
                              Number(matchedTable?.price) || 0;

                            localStorage.setItem(
                              "enjoy-rwanda.pendingBookingContext",
                              JSON.stringify({
                                bookingId: created.id,
                                email: normalizedEmail,
                                restaurantName: restaurant.name,
                                reservationAmount,
                                menuItems: [],
                                menuTotal: 0,
                                numberOfPeople: peopleCount,
                                date: bookingDate,
                                time: bookingTime,
                                createdAt: Date.now(),
                              }),
                            );

                            navigate("/booking-confirming", {
                              state: {
                                bookingId: created.id,
                                email: normalizedEmail,
                                restaurantName: restaurant.name,
                                reservationAmount,
                                menuItems: [],
                                menuTotal: 0,
                                numberOfPeople: peopleCount,
                                date: bookingDate,
                                time: bookingTime,
                              },
                            });
                          } catch (error) {
                            setBookingError(
                              error instanceof Error
                                ? error.message
                                : "Failed to create booking.",
                            );
                          } finally {
                            setBookingSubmitting(false);
                          }
                        }}
                        disabled={bookingSubmitting}
                        className="flex-1 bg-gray-200 !text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        No, Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Menu Selection Step - Show combined total */}
                {menuSelectionStep && (
                  <div className="mt-4 p-4 rounded-xl border-2 border-green-200 bg-green-50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-gray-900">
                        🧾 Order Summary
                      </p>
                      <button
                        type="button"
                        onClick={() => setMenuSelectionStep(false)}
                        className="text-xs text-gray-500 underline"
                      >
                        Change
                      </button>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reservation:</span>
                        <span className="font-semibold">
                          {formatReservationAmount(Number(matchedTable?.price))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Menu Items:</span>
                        <span className="font-semibold">
                          {orderTotal > 0
                            ? `${orderTotal.toLocaleString()} RWF`
                            : "None"}
                        </span>
                      </div>
                      <div className="border-t border-green-200 pt-2 flex justify-between font-bold">
                        <span>Total to Pay:</span>
                        <span className="text-green-700">
                          {(
                            (Number(matchedTable?.price) || 0) + orderTotal
                          ).toLocaleString()}{" "}
                          RWF
                        </span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full bg-green-600 !text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingSubmitting ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                )}

                {/* Regular submit button when no menu prompt shown */}
                {!showMenuPrompt && (
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full sm:w-[220px] mx-auto block bg-[#1a1a2e] !text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2d2d4e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingSubmitting ? "Booking..." : "Book Now"}
                  </button>
                )}
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

          {/* Order Summary & Confirm Booking */}
          <div className="lg:w-80 shrink-0 order-first lg:order-last">
            <div className="sticky top-24 border border-green-200 rounded-2xl p-5 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-900 text-lg">
                  🧾 Order Summary
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("book")}
                  className="text-xs text-gray-500 underline"
                >
                  Change
                </button>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reservation:</span>
                  <span className="font-semibold">
                    {matchedTable
                      ? formatReservationAmount(Number(matchedTable.price))
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Menu Items:</span>
                  <span className="font-semibold">
                    {orderTotal > 0
                      ? `${orderTotal.toLocaleString()} RWF`
                      : "None"}
                  </span>
                </div>
                <div className="border-t border-green-200 pt-2 flex justify-between font-bold">
                  <span>Total to Pay:</span>
                  <span className="text-green-700">
                    {(
                      (Number(matchedTable?.price) || 0) + orderTotal
                    ).toLocaleString()}{" "}
                    RWF
                  </span>
                </div>
              </div>
              {/* Menu Items List */}
              {orderList.length > 0 && (
                <ul className="flex flex-col gap-2 mb-3 max-h-40 overflow-y-auto">
                  {orderList.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-start text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
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
              )}
              {/* Confirm Booking Button */}
              <button
                type="button"
                disabled={
                  !matchedTable ||
                  !guestName.trim() ||
                  !email.trim() ||
                  !telephone.trim() ||
                  !bookingDate ||
                  !bookingTime ||
                  bookingSubmitting
                }
                className={`w-full bg-green-600 !text-white py-3 rounded-xl font-semibold text-base mt-2 transition-colors ${
                  !matchedTable ||
                  !guestName.trim() ||
                  !email.trim() ||
                  !telephone.trim() ||
                  !bookingDate ||
                  !bookingTime ||
                  bookingSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700"
                }`}
                onClick={async () => {
                  if (
                    !matchedTable ||
                    !guestName.trim() ||
                    !email.trim() ||
                    !telephone.trim() ||
                    !bookingDate ||
                    !bookingTime
                  ) {
                    setActiveTab("book");
                    return;
                  }
                  setBookingSubmitting(true);
                  setBookingError("");
                  try {
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
                    const menuId =
                      orderList.length > 0 ? orderList[0].id : undefined;
                    const created = await createBooking({
                      tableId: matchedTable.id ?? null,
                      visitorName: normalizedName,
                      fullnames: normalizedName,
                      email: normalizedEmail,
                      telephone: normalizedPhoneWithCode,
                      numberOfPeople: peopleCount,
                      specialRequest: specialRequests.trim(),
                      date: bookingDate,
                      time: bookingTime,
                      businessId: Number(restaurant.id),
                      menuId,
                    });

                    const reservationAmount = Number(matchedTable?.price) || 0;
                    localStorage.setItem(
                      "enjoy-rwanda.pendingBookingContext",
                      JSON.stringify({
                        bookingId: created.id,
                        email: normalizedEmail,
                        restaurantName: restaurant.name,
                        reservationAmount,
                        menuItems: orderList.map((item) => ({
                          name: item.name,
                          price: item.price,
                        })),
                        menuTotal: orderTotal,
                        numberOfPeople: peopleCount,
                        date: bookingDate,
                        time: bookingTime,
                        createdAt: Date.now(),
                      }),
                    );
                    navigate("/booking-confirming", {
                      state: {
                        bookingId: created.id,
                        email: normalizedEmail,
                        restaurantName: restaurant.name,
                        reservationAmount,
                        menuItems: orderList.map((item) => ({
                          name: item.name,
                          price: item.price,
                        })),
                        menuTotal: orderTotal,
                        numberOfPeople: peopleCount,
                        date: bookingDate,
                        time: bookingTime,
                      },
                    });
                  } catch (error) {
                    setBookingError(
                      error instanceof Error
                        ? error.message
                        : "Failed to create booking.",
                    );
                  } finally {
                    setBookingSubmitting(false);
                  }
                }}
              >
                {bookingSubmitting ? "Booking..." : "Confirm Booking"}
              </button>
              {/* Show error if any */}
              {bookingError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 mt-3">
                  {bookingError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
