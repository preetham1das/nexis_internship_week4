import { useState } from "react";

export default function Cart() {
  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem("cart") || "[]")
  );

  function updateCart(updatedCart) {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  }

  function changeQuantity(id, amount) {
    updateCart(
      cart
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(id) {
    updateCart(cart.filter((item) => item._id !== id));
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="container">
      <h1>Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty. Browse the products page to get started.</p>
      ) : (
        <>
          {cart.map((item) => (
            <article className="cart-item" key={item._id}>
              <div>
                <h3>{item.name}</h3>
                <p>₹{item.price.toLocaleString("en-IN")} each</p>
                <p>Subtotal: ₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
              </div>

              <div className="quantity-controls">
                <button onClick={() => changeQuantity(item._id, -1)}>
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => changeQuantity(item._id, 1)}>
                  +
                </button>
                <button onClick={() => removeItem(item._id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}

          <h2>Total: ₹{total.toLocaleString("en-IN")}</h2>
          <button
            className="checkout-button"
            onClick={() => alert("Checkout is not implemented yet.")}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </main>
  );
}