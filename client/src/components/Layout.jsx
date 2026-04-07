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
    </div>
  );
};

export default Layout;
