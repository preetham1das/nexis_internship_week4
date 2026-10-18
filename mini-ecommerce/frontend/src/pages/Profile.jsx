import { Link } from "react-router-dom";

export default function Profile({ user }) {
  return (
    <main className="profile-page">
      <section className="profile-welcome">
        <span className="eyebrow">Your MiniShop</span>
        <div className="profile-avatar" aria-hidden="true">
          {user?.name?.charAt(0)?.toUpperCase() || "M"}
        </div>
        <h1>Welcome{user?.name ? `, ${user.name}` : " back"}.</h1>
        <p>
          Your space for good finds and everyday favorites. Where would you
          like to go?
        </p>
        {user?.email && <span className="profile-email">{user.email}</span>}
      </section>

      <section className="profile-shortcuts" aria-label="Your shop">
        <Link className="profile-shortcut" to="/products">
          <span className="profile-shortcut-icon" aria-hidden="true">✳</span>
          <span className="profile-shortcut-copy">
            <strong>Explore products</strong>
            <span>Browse the things we picked for you.</span>
          </span>
          <span className="profile-shortcut-arrow" aria-hidden="true">→</span>
        </Link>
        <Link className="profile-shortcut" to="/cart">
          <span className="profile-shortcut-icon profile-cart-icon" aria-hidden="true">♡</span>
          <span className="profile-shortcut-copy">
            <strong>Your cart</strong>
            <span>Keep all your favorite finds together.</span>
          </span>
          <span className="profile-shortcut-arrow" aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
