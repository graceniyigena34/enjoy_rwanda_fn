import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { shops } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import "./DetailPage.css";

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  const shop = shops.find((s) => s.id === Number(id));
  const [added, setAdded] = useState<number | null>(null);

  if (!shop) return <div className="not-found">Shop not found. <Link to="/shops">Go back</Link></div>;

  const handleAddToCart = (product: typeof shop.products[0]) => {
    if (!user) { navigate("/login"); return; }
    addToCart({ id: product.id, name: product.name, price: product.price, vendorName: shop.name, image: product.image });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="detail-page">
      <div className="detail-hero">
        <img src={shop.image} alt={shop.name} />
        <div className="detail-hero-info">
          <span className="badge badge-shop">{shop.category}</span>
          <h1>{shop.name}</h1>
          <p>{shop.description}</p>
          <div className="meta-row">
            <span>📍 {shop.location}</span>
            <span>⭐ {shop.rating}</span>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Link to={`/chat/${shop.id}?type=shop`} className="btn-outline" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
              💬 Chat with Vendor
            </Link>
          </div>
        </div>
      </div>

      <h3 style={{ color: "#1a5c38", marginBottom: "1.5rem" }}>Products</h3>
      <div className="products-grid">
        {shop.products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <div className="product-card-body">
              <h4>{product.name}</h4>
              <p>{product.description}</p>
              <div className="product-card-footer">
                <div>
                  <div className="price">{product.price.toLocaleString()} RWF</div>
                  <div className="stock">In stock: {product.stock}</div>
                </div>
                <button
                  className={`btn-add ${added === product.id ? "added" : ""}`}
                  onClick={() => handleAddToCart(product)}
                >
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
