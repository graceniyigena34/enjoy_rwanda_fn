import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Payment.css";

type Method = "card" | "mtn" | "airtel" | "paypal";

export default function Payment() {
  const { cartTotal, clearCart, cart } = useApp();
  const navigate = useNavigate();
  const total = cartTotal + 500;

  const [method, setMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [phone, setPhone] = useState("");

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      clearCart();
    }, 2000);
  };

  if (cart.length === 0 && !done) {
    return (
      <div className="payment-page">
        <div className="pay-empty">
          <p>No items to pay for.</p>
          <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="payment-page">
        <div className="pay-success">
          <div className="pay-success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your order has been confirmed. A receipt has been sent to your email.</p>
          <div className="pay-success-actions">
            <button className="btn-primary" onClick={() => navigate("/orders")}>View My Orders</button>
            <Link to="/" className="btn-outline">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Secure Payment</h1>
      <div className="payment-layout">
        {/* Method selector */}
        <div className="payment-form-section">
          <h3>Choose Payment Method</h3>
          <div className="method-tabs">
            {(["card", "mtn", "airtel", "paypal"] as Method[]).map((m) => (
              <button key={m} className={`method-tab ${method === m ? "active" : ""}`} onClick={() => setMethod(m)}>
                {m === "card" && "💳 Card"}
                {m === "mtn" && "📱 MTN MoMo"}
                {m === "airtel" && "📱 Airtel Money"}
                {m === "paypal" && "🅿️ PayPal"}
              </button>
            ))}
          </div>

          <form className="pay-form" onSubmit={handlePay}>
            {method === "card" && (
              <>
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={cardNum} onChange={(e) => setCardNum(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())} required />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Expiry</label>
                    <input type="text" placeholder="MM/YY" maxLength={5} value={expiry}
                      onChange={(e) => setExpiry(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="password" placeholder="•••" maxLength={3} value={cvv}
                      onChange={(e) => setCvv(e.target.value)} required />
                  </div>
                </div>
              </>
            )}
            {(method === "mtn" || method === "airtel") && (
              <div className="form-group">
                <label>{method === "mtn" ? "MTN" : "Airtel"} Mobile Number</label>
                <input type="tel" placeholder="+250 7XX XXX XXX" value={phone}
                  onChange={(e) => setPhone(e.target.value)} required />
                <p className="hint">You will receive a prompt on your phone to confirm payment.</p>
              </div>
            )}
            {method === "paypal" && (
              <div className="form-group">
                <label>PayPal Email</label>
                <input type="email" placeholder="you@example.com" required />
                <p className="hint">You will be redirected to PayPal to complete payment.</p>
              </div>
            )}
            <button type="submit" className="btn-primary pay-btn" disabled={processing}>
              {processing ? "Processing..." : `Pay ${total.toLocaleString()} RWF`}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="pay-summary">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="pay-item">
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()} RWF</span>
            </div>
          ))}
          <div className="pay-divider" />
          <div className="pay-item"><span>Service Fee</span><span>500 RWF</span></div>
          <div className="pay-item pay-total"><span>Total</span><span>{total.toLocaleString()} RWF</span></div>
          <div className="secure-badge">🔒 Secured by SSL Encryption</div>
        </div>
      </div>
    </div>
  );
}
