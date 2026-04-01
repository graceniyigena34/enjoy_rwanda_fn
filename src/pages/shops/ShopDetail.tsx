import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { shops } from "../../data/mockData";
import { useApp } from "../../context/AppContext";

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  const shop = shops.find(s => s.id === Number(id));
  const [added, setAdded] = useState<number|null>(null);

  if (!shop) return <div className="p-10 text-center">Shop not found. <Link to="/shops" className="text-blue-600 underline">Go back</Link></div>;

  const handleAddToCart = (product: typeof shop.products[0]) => {
    if (!user) { navigate("/login"); return; }
    addToCart({ id: product.id, name: product.name, price: product.price, vendorName: shop.name, image: product.image });
    setAdded(product.id); setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <img src={shop.image} alt={shop.name} className="w-full md:w-80 h-56 object-cover rounded-2xl" />
        <div className="flex flex-col justify-center">
          <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium w-fit mb-2">{shop.category}</span>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{shop.name}</h1>
          <p className="text-gray-500 mb-3">{shop.description}</p>
          <div className="flex gap-4 text-sm text-gray-500 mb-4">
            <span>📍 {shop.location}</span>
            <span>⭐ {shop.rating}</span>
          </div>
          <Link to={`/chat/${shop.id}?type=shop`} className="w-fit flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-800 transition-colors">
            💬 Chat with Vendor
          </Link>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-5">Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shop.products.map(product => (
          <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img src={product.image} alt={product.name} className="w-full h-44 object-cover" />
            <div className="p-4">
              <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
              <p className="text-sm text-gray-500 mb-3">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{product.price.toLocaleString()} RWF</div>
                  <div className="text-xs text-gray-400">In stock: {product.stock}</div>
                </div>
                <button onClick={() => handleAddToCart(product)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${added === product.id ? "bg-green-500 text-white" : "bg-[#1a1a2e] text-white hover:bg-[#2d2d4e]"}`}>
                  {added === product.id ? "✓ Added" : "+ Add"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
