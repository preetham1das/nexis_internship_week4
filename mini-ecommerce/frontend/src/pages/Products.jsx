import { useEffect, useState } from "react";
import api from "../api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products")
      .then((response) => setProducts(response.data))
      .catch(() => setError("Could not load products. Check the backend."))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item._id === product._id);

    const updatedCart = existing
      ? cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { ...product, quantity: 1 }];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert("Product added to cart!");
  }

  if (loading) return <p className="status">Loading products...</p>;
  if (error) return <p className="error status">{error}</p>;

  return (
    <main className="container">
      <header className="page-hero">
        <div>
          <span className="eyebrow">Curated essentials</span>
          <h1>Shop smarter, live better.</h1>
          <p>Find beautiful everyday pieces that feel as good as they look.</p>
        </div>
        <div className="hero-metric">
          <span>Fresh arrivals</span>
          <strong>New this week</strong>
        </div>
      </header>

      {products.length === 0 ? (
        <p className="empty-state">The shelves are being stocked. Check back soon for new finds.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product._id}>
              <img
                src={product.image || "https://placehold.co/300x200?text=Product"}
                alt={product.name}
              />
              <div className="product-info">
                <div className="product-meta">
                  <span className="product-tag">Best seller</span>
                  <span className="product-rating">★ 4.8</span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-footer">
                  <h3 className="product-price">₹{product.price.toLocaleString("en-IN")}</h3>
                  <button onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}