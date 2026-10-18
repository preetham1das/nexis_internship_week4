import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    onLogout();
    navigate("/", { replace: true });
  }

  return (
    <nav className="navbar">
      <Link className="brand" to="/">MiniShop</Link>

      <div className="nav-links">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <span>Hello, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link className="nav-signup" to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}