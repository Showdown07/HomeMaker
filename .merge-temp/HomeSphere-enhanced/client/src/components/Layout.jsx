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
              <span className="user-pill">👤 {auth.user.name}</span>
              <button className="ghost-button" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="topbar-actions">
              <Link className="ghost-link" to="/login">Login</Link>
              <Link className="primary-link" to="/register">Get Started →</Link>
            </div>
          )}
        </div>
      </header>

      <main className="page">{children}</main>

      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid var(--border)",
        background: "rgba(255,252,245,0.6)",
        backdropFilter: "blur(16px)",
        padding: "2.5rem 0 1.5rem",
      }}>
        <div style={{ width: "min(1260px, calc(100% - 2.5rem))", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
            <div>
              <div className="brand" style={{ marginBottom: "0.75rem" }}>
                <span className="brand-mark" style={{ width: "2.1rem", height: "2.1rem", fontSize: "0.78rem" }}>HS</span>
                <span style={{ fontSize: "1.1rem" }}>HomeSphere</span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                Trusted home services, curated and ranked for your neighbourhood.
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600, marginBottom: "0.75rem" }}>Platform</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {[["Home", "/"], ["Register", "/register"], ["Login", "/login"]].map(([label, path]) => (
                  <Link key={path} to={path} style={{ fontSize: "0.88rem", color: "var(--text-soft)", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "var(--brand)"}
                    onMouseLeave={e => e.target.style.color = "var(--text-soft)"}
                  >{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600, marginBottom: "0.75rem" }}>Categories</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {["Cleaning", "Cooking", "Electrician", "Plumbing", "Painting"].map((c) => (
                  <span key={c} style={{ fontSize: "0.88rem", color: "var(--text-soft)" }}>{c}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", fontWeight: 600, marginBottom: "0.75rem" }}>Trust</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.88rem", color: "var(--text-soft)" }}>
                <span>🛡️ Verified providers</span>
                <span>📍 Location-aware</span>
                <span>⭐ Rated & reviewed</span>
                <span>🔔 Real-time notifications</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>© 2025 HomeSphere · Concierge-grade home services</p>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Built with ❤️ for modern homes</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
