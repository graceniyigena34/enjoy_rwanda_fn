import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const sampleProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: [
    "Fresh Avocado",
    "Rwanda Premium Coffee",
    "Handwoven Basket",
    "Men Traditional Shirt",
    "Organic Honey",
    "Smart Watch X7",
    "Natural Skincare Set",
    "Wooden Serving Bowl",
    "Rwanda Sisal Bag",
    "Men Casual Sneakers",
    "Herbal Tea Pack",
    "Ceramic Mug",
  ][i % 12],
  price: (Math.floor(Math.random() * 30) + 1) * 1000,
  rating: (Math.random() * 1.5 + 3.5).toFixed(1),
  shop: ["Kigali Fresh Store", "Inzuki Designs", "Rwanda Natural Products"][
    i % 3
  ],
  location: ["Kigali", "Musanze", "Huye"][i % 3],
}));

const sampleShops = [
  "Kigali Fresh Store",
  "Rwanda Natural Products",
  "Inzuki Designs",
  "Tech Rwanda",
  "Urban Steps Rwanda",
  "Huye Crafts",
  "Musanze Market",
];

export default function Products() {
  const { addToCart } = useApp();
  const [shopQuery, setShopQuery] = useState("");
  const [showMoreShops, setShowMoreShops] = useState(false);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("newest");

  const filteredShops = sampleShops.filter((s) =>
    s.toLowerCase().includes(shopQuery.toLowerCase()),
  );

  const visibleShops = showMoreShops
    ? filteredShops
    : filteredShops.slice(0, 4);

  function toggleShop(name: string) {
    setSelectedShops((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  }

  function handleAddToCart(product: (typeof sampleProducts)[number]) {
    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      vendorName: product.shop,
      image: "",
    });
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex gap-8 items-start">
        <aside className="w-72 hidden lg:block lg:sticky lg:top-24 self-start">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-bold">Filters</h3>
            <div className="mb-4">
              <h4 className="font-semibold">Categories</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" /> All Categories
                  </label>
                </li>
                <li>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" /> Agriculture & Food
                  </label>
                </li>
                <li>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" /> Handmade & Crafts
                  </label>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold">Price Range</h4>
              <div className="mt-2">
                <input type="range" min={500} max={100000} className="w-full" />
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                  <span>500 RWF</span>
                  <span>100,000 RWF</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">Location</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                <li>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="loc" defaultChecked /> All Rwanda
                  </label>
                </li>
                <li>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="loc" /> Kigali
                  </label>
                </li>
                <li>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="loc" /> Musanze
                  </label>
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Shops</h4>
              <div className="mt-2">
                <input
                  value={shopQuery}
                  onChange={(e) => setShopQuery(e.target.value)}
                  placeholder="Search shop..."
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {visibleShops.map((s) => (
                  <li key={s}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedShops.includes(s)}
                        onChange={() => toggleShop(s)}
                      />
                      {s}
                    </label>
                  </li>
                ))}
              </ul>
              {filteredShops.length > 4 && (
                <button
                  onClick={() => setShowMoreShops((v) => !v)}
                  className="mt-2 text-sm text-green-600"
                >
                  {showMoreShops ? "Show less" : "View more"}
                </button>
              )}
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Products</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">1,248 products found</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Sort by:</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sampleProducts.map((p) => (
              <article
                key={p.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="h-44 w-full rounded-md bg-slate-100" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {p.title}
                </h3>
                <div className="mt-1 text-sm text-slate-600">
                  {p.price.toLocaleString()} RWF
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {p.shop} · {p.location}
                  </div>
                  <div className="text-xs text-amber-500">★ {p.rating}</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/shops`}
                    className="flex-1 block text-center rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                  >
                    View Product
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    Add Cart
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center">
            <nav className="inline-flex items-center gap-2">
              <button className="px-3 py-1 rounded border bg-white">
                &lt;
              </button>
              <button className="px-3 py-1 rounded border bg-green-600 text-white">
                1
              </button>
              <button className="px-3 py-1 rounded border bg-white">2</button>
              <button className="px-3 py-1 rounded border bg-white">3</button>
              <button className="px-3 py-1 rounded border bg-white">
                &gt;
              </button>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}
