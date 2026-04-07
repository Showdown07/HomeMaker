import { useEffect, useState } from "react";
import api from "../api/api.js";
import ServiceCard from "../components/ServiceCard.jsx";
import ServiceFilters from "../components/ServiceFilters.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORY_LIST = [
  { icon: "🧹", label: "Cleaning", value: "cleaning" },
  { icon: "🍳", label: "Cooking", value: "cooking" },
  { icon: "⚡", label: "Electrician", value: "electrician" },
  { icon: "🔧", label: "Plumber", value: "plumber" },
  { icon: "🖌️", label: "Painting", value: "painting" },
  { icon: "🔨", label: "Appliance Repair", value: "appliance repair" },
];

const HOW_IT_WORKS = [
  { icon: "🔍", title: "Search & Filter", desc: "Browse verified providers in your city, filtered by distance, rating, and category." },
  { icon: "📅", title: "Reserve a Slot", desc: "Pick a time that works for you from a provider's live availability calendar." },
  { icon: "✅", title: "Get It Done", desc: "Your provider arrives on time. Rate the experience and help others discover the best." },
];

const TRUST_ITEMS = [
  { icon: "🛡️", label: "Verified Providers" },
  { icon: "📍", label: "Geo-aware Ranking" },
  { icon: "⭐", label: "Rated & Reviewed" },
  { icon: "🔔", label: "Real-time Alerts" },
  { icon: "💬", label: "Admin Support" },
];

const HomePage = () => {
  const { auth } = useAuth();
  const [services, setServices] = useState([]);
  const [localContacts, setLocalContacts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [currentFilters, setCurrentFilters] = useState({
    city: "Bengaluru", lat: "12.9716", lng: "77.5946", pincode: "", category: "",
  });
  const [helpForm, setHelpForm] = useState({
    category: "electrician", title: "", description: "",
    city: "Bengaluru", pincode: "", area: "", address: "", phone: "",
  });

  const fetchServices = async (params = {}) => {
    try {
      setLoading(true);
      const [{ data: serviceData }, { data: contactData }] = await Promise.all([
        api.get("/services", { params }),
        api.get("/local-contacts", {
          params: { city: params.city, pincode: params.pincode, category: params.category },
        }),
      ]);
      setServices(serviceData.data);
      setLocalContacts(contactData.data);
      setCurrentFilters((c) => ({ ...c, ...params }));
      setHelpForm((c) => ({ ...c, city: params.city || c.city, pincode: params.pincode ?? c.pincode }));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices({ city: "Bengaluru", lat: "12.9716", lng: "77.5946" });
  }, []);

  useEffect(() => {
    if (!auth.token || (auth.user?.role !== "user" && auth.user?.role !== "admin")) {
      setHelpRequests([]);
      return;
    }
    const load = async () => {
      try {
        const { data } = await api.get("/help-requests");
        setHelpRequests(data.data);
      } catch { setHelpRequests([]); }
    };
    load();
  }, [auth.token, auth.user?.role]);

  const topRatedService = services[0];

  const handleHelpChange = (e) => setHelpForm((c) => ({ ...c, [e.target.name]: e.target.value }));

  const submitHelpRequest = async (e) => {
    e.preventDefault();
    try {
      setError(""); setMessage("");
      await api.post("/help-requests", { ...helpForm, lat: Number(currentFilters.lat), lng: Number(currentFilters.lng) });
      setMessage("Your local help request has been sent to the admin team.");
      setHelpForm((c) => ({ ...c, title: "", description: "", area: "", address: "", phone: "" }));
      const { data } = await api.get("/help-requests");
      setHelpRequests(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send help request");
    }
  };

  const handleCategoryPill = (value) => {
    const next = activeCategory === value ? "" : value;
    setActiveCategory(next);
    fetchServices({ ...currentFilters, category: next });
  };

  return (
    <div className="stack-xl">
      {/* Hero */}
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Crafted for modern homes</span>
          <h1>Book home care that feels curated, not crowded.</h1>
          <p>
            Discover trusted professionals with live availability, geo-aware ranking, and a calmer
            booking journey designed to feel premium from the first search.
          </p>
          <div className="hero-metrics">
            <div className="metric-tile">
              <strong>{services.length || 0}</strong>
              <span>Live services</span>
            </div>
            <div className="metric-tile">
              <strong>Real-time</strong>
              <span>Notifications</span>
            </div>
            <div className="metric-tile">
              <strong>AI rank</strong>
              <span>Distance + trust</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-header">
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Spotlight pick</p>
            <span className="trending-badge">AI-ranked</span>
          </div>
          {topRatedService ? (
            <>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>{topRatedService.name}</strong>
              <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{topRatedService.provider?.name}</span>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>{topRatedService.description}</p>
              <div className="spotlight-meta">
                <span className="category-chip">₹{topRatedService.price}</span>
                <span className="soft-chip">{topRatedService.provider?.city || topRatedService.city}</span>
                <span className="distance-chip">★ {Number(topRatedService.provider?.averageRating || 0).toFixed(1)}</span>
              </div>
            </>
          ) : (
            <>
              <strong style={{ fontFamily: "var(--font-display)" }}>65% rating + 35% distance</strong>
              <span style={{ fontSize: "0.88rem", color: "var(--muted)" }}>Services closer to the customer and rated highly float to the top.</span>
            </>
          )}
        </div>
      </section>

      {/* Trust bar */}
      <div className="trust-bar">
        {TRUST_ITEMS.map((item) => (
          <div key={item.label} className="trust-item">
            <span className="trust-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* Category quick-filter pills */}
      <div className="dashboard-card" style={{ padding: "1.4rem 1.6rem" }}>
        <p className="label-text" style={{ marginBottom: "0.9rem" }}>Browse by category</p>
        <div className="category-pills">
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat.value}
              className={`category-pill ${activeCategory === cat.value ? "active" : ""}`}
              onClick={() => handleCategoryPill(cat.value)}
            >
              <span className="category-pill-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filters */}
      <ServiceFilters onSearch={fetchServices} />

      {/* How It Works */}
      <section>
        <div style={{ marginBottom: "1.2rem" }}>
          <span className="eyebrow dark">How it works</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", marginTop: "0.5rem", color: "var(--text)" }}>Three steps to a service you love</h2>
        </div>
        <div className="how-it-works">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="how-step">
              <div className="how-step-icon">{step.icon}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Discovery section */}
      <section className="section-banner">
        <div>
          <span className="eyebrow dark">Discovery board</span>
          <h2>Recommended around your chosen area</h2>
        </div>
        <p>
          Results blend provider rating and travel distance so the first options are both reliable
          and realistically available where you actually are.
        </p>
      </section>

      {loading && <div className="loading-bar" />}
      {message && <p className="success-text fade-in">✓ {message}</p>}
      {error && <p className="error-text fade-in">⚠ {error}</p>}

      {services.length ? (
        <section className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </section>
      ) : (
        !loading && (
          <section className="empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
            <h3>No services matched this search</h3>
            <p>Try changing the city, category, or map selection to widen the discovery radius.</p>
          </section>
        )
      )}

      {/* Local Contacts */}
      <section className="section-banner">
        <div>
          <span className="eyebrow dark">Local helplines</span>
          <h2>Offline contacts collected by the admin field team</h2>
        </div>
        <p>
          These local providers are not registered on the platform yet, but admins can list trusted
          nearby contacts by area, city, and service category for quick help.
        </p>
      </section>

      {localContacts.length ? (
        <section className="service-grid compact-grid">
          {localContacts.map((contact) => (
            <article className="compact-card" key={contact._id}>
              <div className="service-card-top">
                <span className="category-chip">{contact.category}</span>
                <span className="soft-chip">📌 {contact.area || contact.city}</span>
              </div>
              <div className="provider-card-mini">
                <div className="provider-avatar">
                  {contact.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <strong style={{ fontFamily: "var(--font-display)", display: "block" }}>{contact.name}</strong>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{contact.city}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.88rem" }}>{contact.notes || "Trusted local contact collected by the admin field team."}</p>
              <div className="meta-grid">
                <span><strong>📞 {contact.phone}</strong></span>
                <span>{contact.alternatePhone || "No alternate"}</span>
                <span>🏙 {contact.city}</span>
                <span>📮 {contact.pincode || "No pincode"}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        !loading && (
          <section className="empty-state subtle">
            <h3>No local helpline contacts for this area</h3>
            <p>The admin field directory has no extra contacts for {currentFilters.city || "this area"} yet.</p>
          </section>
        )
      )}

      {/* Help Request & My Requests */}
      <div className="provider-layout">
        <section className="dashboard-card editorial-card">
          <h2>Need help finding someone locally?</h2>
          <p className="muted-text" style={{ marginBottom: "1rem" }}>
            Raise a requirement with your area and job details, and the admin field team can line
            up suitable offline contacts around your selected location.
          </p>
          {auth.user ? (
            <form className="grid-form" onSubmit={submitHelpRequest}>
              <label className="field-shell">
                <span>Category</span>
                <select name="category" value={helpForm.category} onChange={handleHelpChange}>
                  {CATEGORY_LIST.map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </label>
              <label className="field-shell">
                <span>Job title</span>
                <input name="title" placeholder="e.g. Fix kitchen sink" value={helpForm.title} onChange={handleHelpChange} />
              </label>
              <label className="field-shell full-width">
                <span>What do you need?</span>
                <textarea name="description" placeholder="Describe the job in a few sentences..." value={helpForm.description} onChange={handleHelpChange} />
              </label>
              <label className="field-shell">
                <span>City</span>
                <input name="city" value={helpForm.city} onChange={handleHelpChange} />
              </label>
              <label className="field-shell">
                <span>Pincode</span>
                <input name="pincode" value={helpForm.pincode} onChange={handleHelpChange} />
              </label>
              <label className="field-shell">
                <span>Area</span>
                <input name="area" placeholder="e.g. Koramangala" value={helpForm.area} onChange={handleHelpChange} />
              </label>
              <label className="field-shell">
                <span>Contact phone</span>
                <input name="phone" placeholder="+91 xxxxx xxxxx" value={helpForm.phone} onChange={handleHelpChange} />
              </label>
              <label className="field-shell full-width">
                <span>Address</span>
                <input name="address" placeholder="Full address for the job" value={helpForm.address} onChange={handleHelpChange} />
              </label>
              <button className="primary-button full-width" type="submit">
                📨 Send Help Request
              </button>
            </form>
          ) : (
            <section className="empty-state subtle">
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔐</div>
              <h3>Login to request local help</h3>
              <p>Users can submit offline help needs once signed in.</p>
            </section>
          )}
        </section>

        <section className="dashboard-card">
          <h2>Your recent local help requests</h2>
          {helpRequests.length ? (
            <div className="stack-md">
              {helpRequests.map((req) => (
                <article key={req._id} className="review-card">
                  <div className="dashboard-head">
                    <div>
                      <strong style={{ fontFamily: "var(--font-display)" }}>{req.title}</strong>
                      <p style={{ fontSize: "0.84rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                        {req.category} · {req.city}{req.area ? ` · ${req.area}` : ""}
                      </p>
                    </div>
                    <span className={`status-pill status-${req.status}`}>{req.status}</span>
                  </div>
                  <p style={{ fontSize: "0.88rem", marginTop: "0.5rem" }}>{req.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <section className="empty-state subtle">
              <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>📋</div>
              <h3>No help requests yet</h3>
              <p>Your local support needs will appear here after you submit one.</p>
            </section>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
