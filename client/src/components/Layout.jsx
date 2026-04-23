import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

const Layout = ({ children }) => {
  const { auth, logout } = useAuth();

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">HS</span>
          <span>
            HomeSphere
            <small>Concierge-grade home services</small>
          </span>
        </Link>
        <div className="nav-cluster">
          <nav className="nav">
            <NavLink to="/">Home</NavLink>
            {auth.user?.role === "user" && <NavLink to="/dashboard">My Bookings</NavLink>}
            {auth.user?.role === "provider" && <NavLink to="/provider">Provider Hub</NavLink>}
            {auth.user?.role === "admin" && <NavLink to="/admin">Admin Console</NavLink>}
            {auth.user && <NavLink to="/profile">Profile</NavLink>}
          </nav>
          {auth.user ? (
            <div className="topbar-actions">
              <NotificationBell />
              <span className="user-pill">{auth.user.name}</span>
              <button className="ghost-button" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="topbar-actions">
              <Link className="ghost-link" to="/login">
                Login
              </Link>
              <Link className="primary-link" to="/register">
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="page">{children}</main>
      <footer className="site-footer">
        <div className="site-footer-grid">
          <div>
            <div className="brand footer-brand">
              <span className="brand-mark">HS</span>
              <span>
                HomeSphere
                <small>Concierge-grade home services</small>
              </span>
            </div>
            <p className="site-footer-copy">
              Trusted home services, curated and ranked for the neighborhoods that matter to you.
            </p>
          </div>

          <div>
            <p className="site-footer-label">Platform</p>
            <div className="site-footer-links">
              <Link to="/">Home</Link>
              <Link to="/register">Register</Link>
              <Link to="/login">Login</Link>
            </div>
          </div>

          <div>
            <p className="site-footer-label">Categories</p>
            <div className="site-footer-links">
              <span>Cleaning</span>
              <span>Cooking</span>
              <span>Electrician</span>
              <span>Plumbing</span>
              <span>Painting</span>
            </div>
          </div>

          <div>
            <p className="site-footer-label">Trust</p>
            <div className="site-footer-links">
              <span>Verified providers</span>
              <span>Location-aware discovery</span>
              <span>Rated and reviewed</span>
              <span>Real-time notifications</span>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p>Copyright 2026 HomeSphere</p>
          <p>Built for modern homes</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
