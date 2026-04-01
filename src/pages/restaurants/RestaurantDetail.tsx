import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { restaurants } from "../../data/mockData";
import { useApp } from "../../context/AppContext";

export default function RestaurantDetail() {
  const { id } = useParams();
  const { addToCart } = useApp();

  const restaurant = restaurants.find(r => r.id === Number(id));

  // ✅ Default is BOOK
  const [activeTab, setActiveTab] = useState<"menu" | "book">("book");

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [preOrder, setPreOrder] = useState<Record<number, number>>({});
  const [preOrderDone, setPreOrderDone] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [people, setPeople] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  if (!restaurant)
    return (
      <div className="p-10 text-center">
        Restaurant not found.{" "}
        <Link to="/restaurants" className="text-blue-600 underline">
          Go back
        </Link>
      </div>
    );

  const updatePreOrder = (id: number, delta: number) => {
    setPreOrder(prev => {
      const qty = (prev[id] ?? 0) + delta;
      if (qty <= 0) { const next = { ...prev }; delete next[id]; return next; }
      return { ...prev, [id]: qty };
    });
  };

  const preOrderTotal = Object.entries(preOrder).reduce((sum, [id, qty]) => {
    const item = restaurant.menu.find(m => m.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const preOrderItems = Object.entries(preOrder).filter(([, qty]) => qty > 0);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingDate || !bookingTime || !guestName || !email || !telephone) return;

    setBookingDone(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full md:w-80 h-56 object-cover rounded-2xl"
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
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {/* ✅ Book first */}
        {(["book", "menu"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${
              activeTab === t
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {t === "menu" ? "🍽️ View Menu" : "📅 Book"}
          </button>
        ))}
      </div>

      {/* ================= BOOKING FIRST ================= */}
      {activeTab === "book" && (
        <div>
          {bookingDone ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-gray-500 mb-6">
                Hi <strong>{guestName}</strong>, your table is reserved for {people} {people === 1 ? "person" : "people"} on {bookingDate} at {bookingTime}
              </p>

              <div className="flex gap-3 justify-center">
                <Link
                  to="/payment"
                  className="bg-[#1a1a2e] !text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d2d4e]"
                >
                  Proceed to Payment
                </Link>
                <button
                  onClick={() => {
                    setBookingDone(false);
                    setGuestName("");
                    setEmail("");
                    setTelephone("");
                    setPeople(1);
                    setSpecialRequests("");
                    setBookingDate("");
                    setBookingTime("");
                    setActiveTab("menu");
                  }}
                  className="border border-gray-200 px-6 py-2.5 rounded-xl font-semibold text-gray-700 hover:border-gray-800"
                >
                  🍽️ View Menu
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Telephone & Number of People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Telephone</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Number of People</label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setPeople(p => Math.max(1, p - 1))} className="px-4 py-2.5 text-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors">−</button>
                    <span className="flex-1 text-center text-sm font-semibold text-gray-900">{people}</span>
                    <button type="button" onClick={() => setPeople(p => Math.min(20, p + 1))} className="px-4 py-2.5 text-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors">+</button>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="Allergies, dietary requirements, special occasions..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors"
              >
                Confirm Booking
              </button>
            </form>
          )}
        </div>
      )}

      {/* ================= MENU SECOND ================= */}
      {activeTab === "menu" && (
        <div>
          {preOrderDone ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pre-Order Placed!</h3>
              <p className="text-gray-500 mb-2">Your food will be ready when you arrive.</p>
              <p className="text-gray-700 font-semibold mb-6">Total: {preOrderTotal.toLocaleString()} RWF</p>
              <div className="flex gap-3 justify-center">
                <Link to="/payment" className="bg-[#1a1a2e] !text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d2d4e]">Proceed to Payment</Link>
                <button onClick={() => { setPreOrder({}); setPreOrderDone(false); }} className="border border-gray-200 px-6 py-2.5 rounded-xl font-semibold text-gray-700 hover:border-gray-800">Order More</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Menu Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {restaurant.menu.map(item => (
                  <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{item.price.toLocaleString()} RWF</span>
                      <div className="flex items-center gap-2">
                        {preOrder[item.id] ? (
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => updatePreOrder(item.id, -1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold">−</button>
                            <span className="px-3 text-sm font-semibold text-gray-900">{preOrder[item.id]}</span>
                            <button onClick={() => updatePreOrder(item.id, 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold">+</button>
                          </div>
                        ) : (
                          <button onClick={() => updatePreOrder(item.id, 1)} className="bg-[#1a1a2e] !text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#2d2d4e]">+ Pre-Order</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              {preOrderItems.length > 0 && (
                <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
                  <h4 className="font-bold text-gray-900 mb-3">🧾 Your Pre-Order</h4>
                  <div className="space-y-2 mb-4">
                    {preOrderItems.map(([id, qty]) => {
                      const item = restaurant.menu.find(m => m.id === Number(id))!;
                      return (
                        <div key={id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} × {qty}</span>
                          <span className="font-semibold text-gray-900">{(item.price * qty).toLocaleString()} RWF</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 mb-4">
                    <span>Total</span>
                    <span>{preOrderTotal.toLocaleString()} RWF</span>
                  </div>
                  <button
                    onClick={() => {
                      preOrderItems.forEach(([id, qty]) => {
                        const item = restaurant.menu.find(m => m.id === Number(id))!;
                        for (let i = 0; i < qty; i++) addToCart({ id: item.id, name: item.name, price: item.price, vendorName: restaurant.name });
                      });
                      setPreOrderDone(true);
                    }}
                    className="w-full bg-[#1a1a2e] !text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors"
                  >
                    Confirm Pre-Order
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}