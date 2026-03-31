import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { restaurants } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import "./DetailPage.css";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user, cart, saveOrder } = useApp();
  const restaurant = restaurants.find((r) => r.id === Number(id));

  const [activeTab, setActiveTab] = useState<"menu" | "book">("book");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingName, setBookingName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [email, setEmail] = useState("");
  const [menuQuery, setMenuQuery] = useState("");
  const [telephone, setTelephone] = useState("");
  const [specificCase, setSpecificCase] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const [orderSaved, setOrderSaved] = useState(false);

  if (!restaurant) return <div className="not-found">Restaurant not found. <Link to="/restaurants">Go back</Link></div>;

  const preOrders = cart.filter((item) => item.vendorName === restaurant?.name);
  const preOrderTotal = preOrders.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const filteredMenu = restaurant.menu.filter((item) => item.name.toLowerCase().includes(menuQuery.toLowerCase()));

  const handleAddToCart = (item: typeof restaurant.menu[0]) => {
    if (!user) { navigate("/login"); return; }
    addToCart({ id: item.id, name: item.name, price: item.price, vendorName: restaurant.name });
    setAdded(item.id);
    setOrderSaved(false);
    setTimeout(() => setAdded(null), 1500);
  };

  const handleSaveOrder = () => {
    if (!user) { navigate("/login"); return; }
    if (preOrders.length === 0) return;
    saveOrder(restaurant.name, preOrders);
    setOrderSaved(true);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!bookingDate || !bookingTime || !bookingName || !email || !telephone || guestCount < 1) return;
    setBookingDone(true);
  };

  return (
    <div className="detail-page">
      <div className="detail-hero">
        <img src={restaurant.image} alt={restaurant.name} />
        <div className="detail-hero-info">
          <span className="badge">{restaurant.cuisine}</span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
          <div className="meta-row">
            <span>📍 {restaurant.location}</span>
            <span>⭐ {restaurant.rating}</span>
            <span>💰 {restaurant.priceRange}</span>
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        <button className={activeTab === "book" ? "active" : ""} onClick={() => setActiveTab("book")}>📅 Book</button>
        <button className={activeTab === "menu" ? "active" : ""} onClick={() => setActiveTab("menu")}>👀 View Menu</button>
      </div>

      {activeTab === "menu" && (
        <div>
          <div className="menu-header">
            <h3>Order List</h3>
            <p>Your current restaurant food order list appears here. Add items from the menu below.</p>
          </div>

          <form className="menu-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="menuQuery">Search Menu</label>
              <input
                id="menuQuery"
                type="text"
                value={menuQuery}
                onChange={(e) => setMenuQuery(e.target.value)}
                placeholder="Search food by name"
              />
            </div>
          </form>

          <div className="preorder-section">
            {preOrders.length === 0 ? (
              <p className="preorder-empty">No items in your order list yet. Add foods from the menu below to start your order.</p>
            ) : (
              <div className="preorder-list">
                {preOrders.map((item) => (
                  <div key={item.id} className="preorder-item">
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.quantity} x {item.price.toLocaleString()} RWF</p>
                    </div>
                    <span className="preorder-total">{(item.price * item.quantity).toLocaleString()} RWF</span>
                  </div>
                ))}
                <div className="preorder-summary">
                  <span>Total</span>
                  <strong>{preOrderTotal.toLocaleString()} RWF</strong>
                </div>
                <button type="button" className="btn-primary" onClick={handleSaveOrder}>
                  Save Order
                </button>
                {orderSaved && <p className="save-order-message">Order saved successfully.</p>}
              </div>
            )}
          </div>

          <div className="menu-grid">
            {filteredMenu.map((item) => (
              <div key={item.id} className="menu-item">
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                </div>
                <div className="menu-item-footer">
                  <span className="price">{item.price.toLocaleString()} RWF</span>
                  <button className={`btn-add ${added === item.id ? "added" : ""}`} onClick={() => handleAddToCart(item)}>
                    {added === item.id ? "✓ Added" : "Add to Order"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "book" && (
        <div className="booking-section">
          {bookingDone ? (
            <div className="success-box">
              <div className="success-icon">✅</div>
              <h3>Booking Confirmed!</h3>
              <p>{bookingName}, your reservation for {guestCount} people is confirmed on {bookingDate} at {bookingTime}.</p>
              <p>We will contact you at {email} or {telephone}.</p>
              {specificCase && <p>Special request: {specificCase}</p>}
              <div className="success-actions">
                <Link to="/payment" className="btn-primary">Proceed to Payment</Link>
                <button className="btn-outline" onClick={() => { setBookingDone(false); setActiveTab("menu"); }}>View Menu</button>
                <button className="btn-outline" onClick={() => { setBookingDone(false); }}>Book Another</button>
              </div>
            </div>
          ) : (
            <form className="booking-form" onSubmit={handleBooking}>
                <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={bookingName} onChange={(e) => setBookingName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telephone</label>
                  <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Number of People</label>
                  <input type="number" min={1} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Specific Case</label>
                <textarea value={specificCase} onChange={(e) => setSpecificCase(e.target.value)} rows={3} placeholder="Any special requests or details" />
              </div>
              <button type="submit" className="btn-primary">Confirm Booking</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
