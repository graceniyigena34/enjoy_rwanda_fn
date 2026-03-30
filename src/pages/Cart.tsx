import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Cart.css";

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, user } = useApp();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Browse restaurants and shops to add items</p>
        <div className="empty-actions">
          <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
          <Link to="/shops" className="btn-outline">Browse Shops</Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) { navigate("/login"); return; }
    navigate("/payment");
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              {item.image && <img src={item.image} alt={item.name} />}
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p className="vendor-name">from {item.vendorName}</p>
                <p className="item-price">{item.price.toLocaleString()} RWF</p>
              </div>
              <div className="qty-controls">
                <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-subtotal">{(item.price * item.quantity).toLocaleString()} RWF</div>
              <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{cartTotal.toLocaleString()} RWF</span></div>
          <div className="summary-row"><span>Service Fee</span><span>500 RWF</span></div>
          <div className="summary-row total"><span>Total</span><span>{(cartTotal + 500).toLocaleString()} RWF</span></div>
          <button className="btn-primary checkout-btn" onClick={handleCheckout}>Proceed to Payment</button>
          <Link to="/restaurants" className="continue-link">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
