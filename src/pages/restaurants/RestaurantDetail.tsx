import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const BASE_URL = "https://enjoy-rwanda-bn-5.onrender.com/api";

type MenuItem = { id: number; name: string; price: number; description: string; category?: string; available?: boolean; imageurl?: string };

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
  menu?: MenuItem[];
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  async function fetchRestaurant() {
    try {
      const res = await fetch(`${BASE_URL}/restaurants/${id}`);
      if (!res.ok) {
        setRestaurant(null);
        return;
      }
      const data = await res.json();
      setRestaurant(data);
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  }

  const [activeTab, setActiveTab] = useState<"menu" | "book">("book");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [people, setPeople] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingSaved, setBookingSaved] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [menuCategory, setMenuCategory] = useState<"All" | "Food" | "Drinks">("All");
  const [orderList, setOrderList] = useState<MenuItem[]>([]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant)
    return (
      <div className="p-10 text-center">
        Restaurant not found.{" "}
        <Link to="/restaurants" className="text-blue-600 underline">Go back</Link>
      </div>
    );

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !guestName || !email || !telephone) return;
    setBookingSaved(true);
    setActiveTab("menu");
  };

  const handleConfirmBooking = () => {
    const newBookingId = `booking-${Date.now()}`;
    const bookingData = {
      id: newBookingId,
      restaurant: restaurant.name,
      guestName, email, telephone, people,
      date: bookingDate, time: bookingTime, specialRequests,
      items: orderList.map(i => i.name),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("enjoy-rwanda.pendingBookings") ?? "[]") as unknown[];
    localStorage.setItem("enjoy-rwanda.pendingBookings", JSON.stringify([...existing, bookingData]));
    localStorage.setItem("enjoy-rwanda.lastBookingId", newBookingId);
    localStorage.removeItem("enjoy-rwanda.confirmingBooking");
    localStorage.setItem("enjoy-rwanda.bookingItems", JSON.stringify(
      orderList.map(i => ({ id: i.id, name: i.name, price: i.price, vendorName: restaurant.name }))
    ));
    navigate("/booking-confirming");
  };

  const handleAddToOrder = (item: MenuItem) => setOrderList(prev => [...prev, item]);
  const handleRemoveFromOrder = (index: number) => setOrderList(prev => prev.filter((_, i) => i !== index));
  const orderTotal = orderList.reduce((sum, item) => sum + item.price, 0);

  const foodItems = (restaurant.menu || []).filter(i => i.category === "Food");
  const drinkItems = (restaurant.menu || []).filter(i => i.category === "Drinks");
  const visibleFood = foodItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const visibleDrinks = drinkItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalVisible = visibleFood.length + visibleDrinks.length;

  const MenuCard = ({ item, priceColor }: { item: MenuItem; priceColor: string }) => (
    <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:shadow-sm hover:border-gray-200 transition-all">
      {item.imageurl && (
        <img src={item.imageurl} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`font-bold text-sm whitespace-nowrap ${priceColor}`}>{item.price.toLocaleString()} RWF</span>
        <button onClick={() => handleAddToOrder(item)} className="bg-[#1a1a2e] !text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2d2d4e] transition-colors">+ Add</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <img src={restaurant.image} alt={restaurant.name} className="w-full md:w-72 h-48 sm:h-56 object-cover rounded-2xl" />
        <div className="flex flex-col justify-center">
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium w-fit mb-2">{restaurant.cuisine}</span>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-gray-500 mb-3">{restaurant.description}</p>
          <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
            <span>📍 {restaurant.location}</span>
            <span>⭐ {restaurant.rating || 'N/A'}</span>
            <span>💰 {restaurant.price_range}</span>
            <span>🕐 {restaurant.hours}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {(["book", "menu"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
            {t === "menu" ? "🍽️ View Menu" : "📅 Book"}
          </button>
        ))}
      </div>

      {/* BOOKING */}
      {activeTab === "book" && (
        <div>
          {bookingSaved ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Details Saved!</h3>
              <p className="text-gray-500 mb-6">Hi <strong>{guestName}</strong>, your details are saved. Now go to the menu tab to select your items and confirm your booking.</p>
              <button onClick={() => setActiveTab("menu")} className="bg-[#1a1a2e] !text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d2d4e]">🍽️ View Menu & Confirm</button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                  <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="John Doe" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Telephone</label>
                  <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+250 7XX XXX XXX" required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Number of People</label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setPeople(p => Math.max(1, p - 1))} className="px-4 py-2.5 text-lg font-bold text-gray-600 hover:bg-gray-100">−</button>
                    <span className="flex-1 text-center text-sm font-semibold text-gray-900">{people}</span>
                    <button type="button" onClick={() => setPeople(p => Math.min(20, p + 1))} className="px-4 py-2.5 text-lg font-bold text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                  <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Time</label>
                  <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Special Requests</label>
                <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Allergies, dietary requirements, special occasions..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none" />
              </div>
              <button type="submit" className="w-full bg-[#1a1a2e] !text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors">Save & Continue</button>
            </form>
          )}
        </div>
      )}

      {/* VIEW MENU */}
      {activeTab === "menu" && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input type="text" placeholder="Search food or drinks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
              <div className="flex gap-2">
                {(["All", "Food", "Drinks"] as const).map(cat => (
                  <button key={cat} onClick={() => setMenuCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${menuCategory === cat ? "bg-[#1a1a2e] !text-white border-[#1a1a2e]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-800"}`}>
                    {cat === "Food" ? "🍛 Food" : cat === "Drinks" ? "🥤 Drinks" : "🍽️ All"}
                  </button>
                ))}
              </div>
            </div>

            {totalVisible === 0 && <p className="text-gray-400 text-sm text-center py-8">No items found.</p>}

            {(menuCategory === "All" || menuCategory === "Food") && visibleFood.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span>🍛</span>
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Food</h3>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{visibleFood.length} items</span>
                </div>
                <div className="flex flex-col gap-3">
                  {visibleFood.map(item => <MenuCard key={item.id} item={item} priceColor="text-orange-700" />)}
                </div>
              </div>
            )}

            {(menuCategory === "All" || menuCategory === "Drinks") && visibleDrinks.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span>🥤</span>
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Drinks</h3>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{visibleDrinks.length} items</span>
                </div>
                <div className="flex flex-col gap-3">
                  {visibleDrinks.map(item => <MenuCard key={item.id} item={item} priceColor="text-blue-700" />)}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-72 shrink-0 order-first lg:order-last">
            <div className="sticky top-24 border border-gray-200 rounded-2xl p-5 bg-gray-50">
              <h2 className="font-bold text-gray-900 mb-4">🧾 Your Pre-Order</h2>
              {orderList.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No items added yet.<br /><span className="text-xs">Click + Add on any item</span></p>
              ) : (
                <>
                  <ul className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
                    {orderList.map((item, i) => (
                      <li key={i} className="flex justify-between items-start text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span className="font-semibold text-gray-900 text-xs">{item.price.toLocaleString()}</span>
                          <button onClick={() => handleRemoveFromOrder(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
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
                disabled={orderList.length === 0 || !bookingSaved}
                onClick={handleConfirmBooking}
                className="w-full bg-green-700 !text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {!bookingSaved ? "Fill booking form first" : orderList.length === 0 ? "Add items to order" : `Confirm Booking (${orderList.length} items)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
