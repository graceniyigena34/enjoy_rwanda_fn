import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { getShopById } from "../../utils/shopCatalog";

type Product = { id: number; name: string; price: number; description: string; image: string; stock: number; active?: boolean };

const EMPTY_PRODUCTS: Product[] = [];

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();

  const shopId = Number(id);
  const shop = Number.isFinite(shopId) ? getShopById(shopId) : null;
  const products = shop?.products ?? EMPTY_PRODUCTS;

  const [orderQty, setOrderQty] = useState<Record<number, number>>({});
  const [orderDone, setOrderDone] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const visible = useMemo(
    () =>
      products
        .filter((p: Product) => (p.active ?? true))
        .filter((p: Product) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm]
  );

  const orderItems = useMemo(() => {
    const items: Array<{ product: Product; qty: number }> = [];
    for (const [productIdRaw, qtyRaw] of Object.entries(orderQty)) {
      const productId = Number(productIdRaw);
      const qty = Number(qtyRaw);
      if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0) continue;
      const product = products.find((p: Product) => p.id === productId);
      if (!product) continue;
      items.push({ product, qty });
    }
    return items;
  }, [orderQty, products]);

  const itemsCount = useMemo(() => orderItems.reduce((sum, item) => sum + item.qty, 0), [orderItems]);
  const orderTotal = useMemo(() => orderItems.reduce((sum, item) => sum + item.product.price * item.qty, 0), [orderItems]);

  const setQty = (productId: number, nextQty: number, maxStock: number) => {
    const safe = Math.max(0, Math.min(Math.max(0, Math.floor(maxStock)), Math.floor(nextQty)));
    setOrderQty((prev) => {
      const next = { ...prev };
      if (safe <= 0) delete next[productId];
      else next[productId] = safe;
      return next;
    });
  };

  const handleConfirm = () => {
    if (!shop) return;
    if (!user) {
      navigate("/login");
      return;
    }
    orderItems.forEach(({ product, qty }) => {
      for (let i = 0; i < qty; i += 1) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          vendorName: shop.name,
          image: product.image,
          shopId: shop.id,
          stock: product.stock,
        });
      }
    });
    setOrderDone(true);
  };

  if (!shop) {
    return (
      <div className="p-10 text-center">
        Shop not found.{" "}
        <Link to="/shops" className="text-blue-600 underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img src={shop.image} alt={shop.name} className="w-full md:w-72 h-48 sm:h-56 object-cover rounded-2xl" />
        <div className="flex flex-col justify-center">
          <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium w-fit mb-2">{shop.category}</span>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{shop.name}</h1>
          <p className="text-gray-500 mb-3">{shop.description}</p>
          <div className="flex gap-4 text-sm text-gray-500 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {shop.location}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {shop.rating}
            </span>
          </div>
          <Link
            to={`/chat/${shop.id}?type=shop`}
            className="w-fit flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-800 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Chat with Vendor
          </Link>
        </div>
      </div>

      {/* Products + Order Summary */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Products */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Products
            </h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{visible.length} items</span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 mb-5 focus-within:border-gray-400 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-none outline-none text-sm py-2.5 bg-transparent placeholder-gray-300"
            />
          </div>

          <div className="flex flex-col gap-3">
            {visible.map((product: Product) => {
              const inOrder = orderQty[product.id] ?? 0;
              const outOfStock = product.stock <= 0;
              const atLimit = inOrder >= product.stock;

              return (
                <div key={product.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4 items-center">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-700">{product.price.toLocaleString()} RWF</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${outOfStock ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => setQty(product.id, inOrder + 1, product.stock)}
                      disabled={outOfStock || atLimit}
                      className="bg-green-600 !text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {outOfStock ? "Out of stock" : atLimit ? "Max in order" : "Add to Order"}
                    </button>

                    {inOrder > 0 && (
                      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1">
                        <button onClick={() => setQty(product.id, inOrder - 1, product.stock)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold">
                          −
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{inOrder}</span>
                        <button
                          onClick={() => setQty(product.id, inOrder + 1, product.stock)}
                          disabled={atLimit}
                          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:w-80 bg-white border border-gray-200 rounded-2xl p-5 bg-gray-50">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            Your Order
          </h2>

          {orderItems.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto mb-2" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <p className="text-gray-400 text-sm">No items added yet.</p>
              <p className="text-xs text-gray-300 mt-1">Click “Add to Order” on any product</p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-2 mb-4 max-h-64 overflow-y-auto">
                {orderItems.map(({ product, qty }) => (
                  <li key={product.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {product.name} × {qty}
                      </p>
                      <p className="text-xs text-gray-400">{product.price.toLocaleString()} RWF</p>
                    </div>
                    <button onClick={() => setQty(product.id, 0, product.stock)} className="text-red-400 hover:text-red-600 ml-2 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 mb-4">
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                  Total
                </span>
                <span>{orderTotal.toLocaleString()} RWF</span>
              </div>
            </>
          )}

          {orderDone ? (
            <div className="text-center py-4">
              <svg className="mx-auto mb-2 text-green-500" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="font-bold text-green-700 text-sm mb-1">Order Confirmed!</p>
              <p className="text-xs text-gray-500 mb-4">Items added to your cart.</p>
              <div className="flex flex-col gap-2">
                <Link to="/payment" className="flex items-center justify-center gap-2 bg-[#1a1a2e] !text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d2d4e] text-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Proceed to Payment
                </Link>
                <button
                  onClick={() => {
                    setOrderQty({});
                    setOrderDone(false);
                  }}
                  className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-800"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  Order More
                </button>
              </div>
            </div>
          ) : (
            <button
              disabled={orderItems.length === 0}
              onClick={handleConfirm}
              className="w-full flex items-center justify-center gap-2 bg-green-700 !text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {orderItems.length === 0 ? "Add items to order" : `Confirm Order (${itemsCount})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
