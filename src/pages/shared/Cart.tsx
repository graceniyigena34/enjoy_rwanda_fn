import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, user } = useApp();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-6xl">🛒</div>
      <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
      <p className="text-gray-500">Browse restaurants and shops to add items</p>
      <div className="flex gap-3">
        <Link to="/restaurants" className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors">Browse Restaurants</Link>
        <Link to="/shops" className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:border-gray-800 transition-colors">Browse Shops</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Your Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                <p className="text-xs text-gray-400">from {item.vendorName}</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{item.price.toLocaleString()} RWF</p>
              </div>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1">
                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold">−</button>
                <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold">+</button>
              </div>
              <span className="text-sm font-bold text-gray-900 w-24 text-right">{(item.price * item.quantity).toLocaleString()} RWF</span>
              <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors text-lg font-bold">✕</button>
            </div>
          ))}
        </div>
        <div className="lg:w-72 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{cartTotal.toLocaleString()} RWF</span></div>
            <div className="flex justify-between text-gray-600"><span>Service Fee</span><span>500 RWF</span></div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span>{(cartTotal + 500).toLocaleString()} RWF</span></div>
          </div>
          <button onClick={() => { if (!user) { navigate("/login"); return; } navigate("/payment"); }}
            className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-semibold hover:bg-[#2d2d4e] transition-colors mb-3">Proceed to Payment</button>
          <Link to="/restaurants" className="block text-center text-sm text-gray-500 hover:text-gray-800 transition-colors">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
