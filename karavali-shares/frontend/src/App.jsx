import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Compass, Heart, LogIn, LogOut, PlusCircle, Utensils, Waves } from "lucide-react";
import { useAuth } from "./context/AuthContext.jsx";
import Feed from "./pages/Feed.jsx";
import AuthPage from "./pages/AuthPage.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark"><Waves size={23} /></span>
        <span><strong>Karavali Shares</strong><small>ನಮ್ಮ ಕರಾವಳಿ · Our Coast, Our Culture</small></span>
      </Link>
      <nav>
        <NavLink to="/" end><Compass size={17} /> Feed</NavLink>
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="nav-button" onClick={() => { logout(); navigate("/"); }}><LogOut size={17} /> Logout</button>
          </>
        ) : (
          <NavLink to="/login"><LogIn size={17} /> Login</NavLink>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<main className="empty-page"><h2>Page not found</h2><Link to="/">Return to feed</Link></main>} />
      </Routes>
      <footer className="footer"><Utensils size={15} /> Celebrating the food, stories and traditions of coastal Karnataka.</footer>
    </>
  );
}
