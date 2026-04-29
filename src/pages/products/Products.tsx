import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { getPublicProducts, type PublicProductRecord } from "../../utils/api";

type ProductListItem = {
  id: number;
  name: string;
  price: number;
  rating: number;
  seller: {
    name: string;
    location: string;
  };
  images: string[];
  stock: number;
};

const FALLBACK_IMAGE = "https://via.placeholder.com/600x400?text=Product";

export default function Products() {
  const { addToCart } = useApp();
  const [shopQuery, setShopQuery] = useState("");
  const [showMoreShops, setShowMoreShops] = useState(false);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("newest");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await getPublicProducts();
        if (!mounted) return;

        const mapped: ProductListItem[] = rows.map(
          (row: PublicProductRecord) => ({
            id: Number(row.id),
            name: row.name,
            price: Number(row.price) || 0,
            // Rating is not yet available on products API; use a stable placeholder.
            rating: 4.6,
            seller: {
              name: row.business_name || "Local Shop",
              location: row.location || "Rwanda",
            },
            images: [row.image_url || FALLBACK_IMAGE],
            stock: Number(row.stock_quantity) || 0,
          }),
        );

        setProducts(mapped);
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredByShop = useMemo(() => {
    if (selectedShops.length === 0) return products;
    return products.filter((product) =>
      selectedShops.includes(product.seller.name),
    );
  }, [products, selectedShops]);

  const listedProducts = [...filteredByShop].sort((left, right) => {
    switch (sort) {
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "rating":
        return right.rating - left.rating;
      default:
        return right.id - left.id;
    }
  });

  const uniqueShops = useMemo(
    () => Array.from(new Set(products.map((product) => product.seller.name))),
    [products],
  );

  const filteredShops = uniqueShops.filter((s) =>
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

  function handleAddToCart(product: ProductListItem) {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      vendorName: product.seller.name,
      image: product.images[0],
      stock: product.stock,
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
              <div className="text-sm text-slate-600">
                {listedProducts.length.toLocaleString()} products found
              </div>
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

          {loading ? (
            <div className="rounded-lg border bg-white p-6 text-sm text-slate-600">
              Loading products...
            </div>
          ) : null}
          {!loading && error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listedProducts.map((p) => (
                <article
                  key={p.id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <Link to={`/products/${p.id}`} className="block">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-44 w-full rounded-md object-cover"
                    />
                  </Link>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">
                    {p.name}
                  </h3>
                  <div className="mt-1 text-sm text-slate-600">
                    {p.price.toLocaleString()} RWF
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {p.seller.name} · {p.seller.location}
                    </div>
                    <div className="text-xs text-amber-500">★ {p.rating}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/products/${p.id}`}
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
          ) : null}

          {!loading && !error && listedProducts.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-sm text-slate-600">
              No products found for the selected filters.
            </div>
          ) : null}

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
