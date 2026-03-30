import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { restaurants } from "../data/mockData";
import { useApp } from "../context/AppContext";
import "./DetailPage.css";

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  const restaurant = restaurants.find((r) => r.id === Number(id));

  const [activeTab, setActiveTab] = useState<"menu" | "book">("menu");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [added, setAdded] = useState<number | null>(null);

  if (!restaurant) return <div className="not-found">Restaurant not found. <Link to="/restaurants">Go back</Link></div>;

  const handleAddToCart = (item: typeof restaurant.menu[0]) => {
    if (!user) { navigate("/login"); return; }
    addToCart({ id: item.id, name: item.name, price: item.price, vendorName: restaurant.name });
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!selectedTable || !bookingDate || !bookingTime) return;
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
        <button className={activeTab === "menu" ? "active" : ""} onClick={() => setActiveTab("menu")}>🍽️ Menu</button>
        <button className={activeTab === "book" ? "active" : ""} onClick={() => setActiveTab("book")}>📅 Book a Table</button>
      </div>

      {activeTab === "menu" && (
        <div className="menu-grid">
          {restaurant.menu.map((item) => (
            <div key={item.id} className="menu-item">
              <div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
              </div>
              <div className="menu-item-footer">
                <span className="price">{item.price.toLocaleString()} RWF</span>
                <button className={`btn-add ${added === item.id ? "added" : ""}`} onClick={() => handleAddToCart(item)}>
                  {added === item.id ? "✓ Added" : "+ Add"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "book" && (
        <div className="booking-section">
          {bookingDone ? (
            <div className="success-box">
              <div className="success-icon">✅</div>
              <h3>Booking Confirmed!</h3>
              <p>Table {restaurant.tables.find((t) => t.id === selectedTable)?.number} reserved for {bookingDate} at {bookingTime}</p>
              <div className="success-actions">
                <Link to="/payment" className="btn-primary">Proceed to Payment</Link>
                <button className="btn-outline" onClick={() => { setBookingDone(false); setSelectedTable(null); }}>Book Another</button>
              </div>
            </div>
          ) : (
            <form className="booking-form" onSubmit={handleBooking}>
              <h3>Select a Table</h3>
              <div className="tables-grid">
                {restaurant.tables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    className={`table-btn ${table.status === "booked" ? "booked" : ""} ${selectedTable === table.id ? "selected" : ""}`}
                    disabled={table.status === "booked"}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <span className="table-num">{table.number}</span>
                    <span className="table-cap">👥 {table.capacity}</span>
                    <span className="table-status">{table.status === "booked" ? "Booked" : "Available"}</span>
                  </button>
                ))}
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
              <button type="submit" className="btn-primary" disabled={!selectedTable}>Confirm Booking</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
