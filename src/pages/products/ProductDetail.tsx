import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { getPublicProduct } from "../../utils/api";
import type { PublicProductRecord } from "../../utils/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const productId = Number(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews" | "shipping"
  >("description");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<{
    id: number;
    name: string;
    price: number;
    description: string | null;
    images: string[];
    stock: number;
    oldPrice?: number | null;
    discount?: string | null;
    features: string[];
    specs: { label: string; value: string }[];
    reviews: number;
    rating: number;
    sold: number;
    seller: {
      name: string;
      avatar: string | null;
      verified: boolean;
      location?: string | null;
      joined?: string;
      response?: string;
      products?: number;
      rating: number;
      reviews: number;
    };
    relatedIds: number[];
  } | null>(null);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab("description");
  }, [productId]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!productId || Number.isNaN(productId)) {
        setProduct(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await getPublicProduct(productId);
        if (!mounted) return;

        const record: PublicProductRecord = res as PublicProductRecord;

        const mapped = {
          id: record.id,
          name: record.name,
          price:
            typeof record.price === "string"
              ? Number(record.price)
              : (record.price as number),
          description: record.description,
          images: record.image_url
            ? [record.image_url]
            : ["/placeholder-product.png"],
          stock: record.stock_quantity ?? 0,
          oldPrice: null,
          discount: null,
          features: [],
          specs: [],
          reviews: 0,
          rating: 4.7,
          sold: 0,
          seller: {
            name: record.business_name ?? "Seller",
            avatar: null,
            verified: Boolean(record.is_verified),
            location: record.location ?? null,
            joined: undefined,
            response: undefined,
            products: undefined,
            rating: 4.5,
            reviews: 10,
          },
          relatedIds: [],
        };

        setProduct(mapped);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const relatedProducts = useMemo<any[]>(() => {
    if (!product) return [];
    return [];
  }, [product]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Loading…</h1>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">
            Product not found
          </h1>
          <p className="mt-2 text-slate-500">
            {error ?? "The product you requested does not exist."}
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = product.images[selectedImage] ?? product.images[0];

  const changeQty = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(product.stock, prev + delta)));
  };

  const handleAddToCart = () => {
    for (let index = 0; index < quantity; index += 1) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        vendorName: product.seller.name,
        image: mainImage,
        stock: product.stock,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  return (
    <div className="bg-slate-50/80">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_1.1fr_0.65fr]">
          <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[92px_1fr]">
              <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
                {product.images.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                      index === selectedImage
                        ? "border-emerald-500"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="order-1 relative overflow-hidden rounded-[22px] bg-slate-100 lg:order-2">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                />
                <button
                  type="button"
                  className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/95 text-slate-700 shadow-sm"
                  aria-label="Open image"
                >
                  ↗
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Best Seller
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>★</span>
                ))}
              </div>
              <span className="text-sm text-slate-500">
                {product.rating} ({product.reviews} reviews)
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500">
                {product.sold} sold
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-black text-emerald-700">
                {product.price.toLocaleString()} RWF
              </span>
              {product.oldPrice ? (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    {product.oldPrice.toLocaleString()} RWF
                  </span>
                  <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-sm font-semibold text-rose-500">
                    {product.discount ?? "-"}
                  </span>
                </>
              ) : null}
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
              {product.description}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 border-y border-slate-200 py-4 sm:grid-cols-3">
              {product.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    ✓
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-600">Quantity:</span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => changeQty(-1)}
                    className="h-10 w-10 text-lg text-slate-600 hover:bg-slate-50"
                  >
                    −
                  </button>
                  <span className="min-w-10 px-4 text-center text-sm font-semibold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(1)}
                    className="h-10 w-10 text-lg text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> In
                Stock
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <span>🛒</span>
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-700 bg-white px-5 py-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <span>⚡</span>
                Buy Now
              </button>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">🛡</span>
                <div>
                  <p className="font-semibold text-slate-900">Secure Payment</p>
                  <p>100% secure payment</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">🚚</span>
                <div>
                  <p className="font-semibold text-slate-900">Fast Delivery</p>
                  <p>Across Rwanda</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">↩</span>
                <div>
                  <p className="font-semibold text-slate-900">Easy Returns</p>
                  <p>7 days return policy</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Sold by</p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={product.seller.avatar ?? undefined}
                  alt={product.seller.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">
                      {product.seller.name}
                    </h2>
                    {product.seller.verified ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        verified
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-amber-500">
                      ★ {product.seller.rating}
                    </span>
                    <span>({product.seller.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{product.seller.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span>Joined {product.seller.joined}</span>
                </div>
              </div>

              <Link
                to="/shops"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-emerald-600 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Visit Shop
              </Link>

              <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">🛡</span>
                  <span>98% Positive Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">🕒</span>
                  <span>{product.seller.response}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600">🎁</span>
                  <span>{product.seller.products}+ Products</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                  🎧
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Need help?</p>
                  <p className="text-sm text-slate-500">
                    Contact the seller directly
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-emerald-600 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Contact Seller
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 pt-5">
              <div className="flex flex-wrap gap-3 text-sm">
                {[
                  ["description", "Description"],
                  ["specs", "Specifications"],
                  ["reviews", `Reviews (${product.reviews})`],
                  ["shipping", "Shipping & Returns"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`border-b-2 px-1 pb-4 font-medium transition ${
                      activeTab === key
                        ? "border-emerald-600 text-emerald-700"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 px-5 py-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                {activeTab === "description" && (
                  <>
                    <p className="text-sm leading-7 text-slate-600">
                      {product.description}
                    </p>
                    <ul className="mt-5 space-y-3 text-sm text-slate-600">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-0.5 text-emerald-600">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeTab === "specs" && (
                  <div className="space-y-3 text-sm">
                    {product.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="grid grid-cols-[140px_1fr] gap-4 border-b border-slate-100 py-2 text-slate-600"
                      >
                        <span className="font-medium text-slate-500">
                          {spec.label}:
                        </span>
                        <span className="text-slate-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4 text-sm text-slate-600">
                    <p>
                      Customers praise the quality, freshness, and fast response
                      from the seller.
                    </p>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        Aline, Kigali
                      </p>
                      <p className="mt-1">
                        "Great quality and fast delivery. The product matched
                        the pictures exactly."
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        Eric, Musanze
                      </p>
                      <p className="mt-1">
                        "Very professional seller, excellent packaging and
                        communication."
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-4 text-sm text-slate-600">
                    <p>
                      Fast delivery across Rwanda with secure payment and a
                      simple return process.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-emerald-600">✓</span>
                        <span>
                          Shipping usually dispatches within 24 hours.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-emerald-600">✓</span>
                        <span>Returns accepted within 7 days if unopened.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-emerald-600">✓</span>
                        <span>Secure payment protection on every order.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="border-b border-slate-100 pb-3"
                    >
                      <p className="text-slate-500">{spec.label}:</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  You may also like
                </h2>
                <p className="text-sm text-slate-500">
                  Similar items from trusted local sellers
                </p>
              </div>
              <Link
                to="/products"
                className="text-sm font-semibold text-emerald-700"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2">
              {relatedProducts.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <Link to={`/products/${item.id}`} className="block">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.price.toLocaleString()} RWF
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>★ {item.rating}</span>
                        <span>{item.seller.name}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Support Local Businesses", "Empower local vendors in Rwanda"],
            ["Quality Products", "Carefully selected for you"],
            ["Secure Shopping", "Your data is safe with us"],
            ["Fast & Reliable Delivery", "Across all of Rwanda"],
          ].map(([title, text]) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl p-1">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                ✓
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
