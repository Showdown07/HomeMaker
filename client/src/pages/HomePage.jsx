import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api.js";
import ServiceCard from "../components/ServiceCard.jsx";
import ServiceFilters from "../components/ServiceFilters.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORY_LIST = [
  { label: "Cleaning", value: "cleaning" },
  { label: "Cooking", value: "cooking" },
  { label: "Electrician", value: "electrician" },
  { label: "Plumber", value: "plumber" },
  { label: "Painting", value: "painting" },
  { label: "Appliance Repair", value: "appliance repair" },
];

const HOW_IT_WORKS = [
  {
    step: "Pick",
    title: "Tell us what you need",
    description:
      "Choose a service, set your area, and instantly see trusted helpers nearby.",
  },
  {
    step: "Book",
    title: "Choose a time that works",
    description:
      "Select an available slot, add your address, and confirm the booking in one flow.",
  },
  {
    step: "Done",
    title: "Relax while we keep you updated",
    description:
      "Chat with the provider, get status updates, and review the service after completion.",
  },
];

const TRUST_ITEMS = [
  "Verified providers",
  "Geo-aware search",
  "AI-based ranking",
  "Real-time updates",
  "Admin support",
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
    city: "Bengaluru",
    lat: "12.9716",
    lng: "77.5946",
    pincode: "",
    category: "",
  });
  const [helpForm, setHelpForm] = useState({
    category: "electrician",
    title: "",
    description: "",
    city: "Bengaluru",
    pincode: "",
    area: "",
    address: "",
    phone: "",
  });

  const fetchServices = async (params = {}) => {
    try {
      setLoading(true);
      const { data: serviceData } = await api.get("/services", { params });
      let contactData = { data: [] };

      if (auth.user?.role === "user" || auth.user?.role === "admin") {
        const { data } = await api.get("/local-contacts", {
          params: {
            city: params.city,
            pincode: params.pincode,
            category: params.category,
          },
        });
        contactData = data;
      }

      setServices(serviceData.data);
      setLocalContacts(contactData.data);
      setCurrentFilters((current) => ({ ...current, ...params }));
      setHelpForm((current) => ({
        ...current,
        city: params.city || current.city,
        pincode: params.pincode ?? current.pincode,
      }));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.loading) return;

    fetchServices({
      city: "Bengaluru",
      lat: "12.9716",
      lng: "77.5946",
    });
  }, [auth.loading, auth.user?.role]);

  useEffect(() => {
    if (!auth.token || (auth.user?.role !== "user" && auth.user?.role !== "admin")) {
      setHelpRequests([]);
      return;
    }

    const loadHelpRequests = async () => {
      try {
        const { data } = await api.get("/help-requests");
        setHelpRequests(data.data);
      } catch {
        setHelpRequests([]);
      }
    };

    loadHelpRequests();
  }, [auth.token, auth.user?.role]);

  const handleHelpChange = (event) => {
    setHelpForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitHelpRequest = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setMessage("");
      await api.post("/help-requests", {
        ...helpForm,
        lat: Number(currentFilters.lat),
        lng: Number(currentFilters.lng),
      });
      setMessage("Your local help request has been sent to the admin team.");
      setHelpForm((current) => ({
        ...current,
        title: "",
        description: "",
        area: "",
        address: "",
        phone: "",
      }));
      const { data } = await api.get("/help-requests");
      setHelpRequests(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send help request");
    }
  };

  const handleCategoryPill = (value) => {
    const nextCategory = activeCategory === value ? "" : value;
    setActiveCategory(nextCategory);
    fetchServices({
      ...currentFilters,
      category: nextCategory,
    });
  };

  const topRatedService = services[0];

  return (
    <div className="stack-xl">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Modern home services</span>
          <h1>Book trusted help near you.</h1>
          <p>
            Find verified providers, compare options, and reserve a real slot in minutes.
          </p>
          <div className="hero-metrics">
            <div className="metric-tile">
              <strong>{services.length || 0}</strong>
              <span>Services</span>
            </div>
            <div className="metric-tile">
              <strong>Live</strong>
              <span>Updates</span>
            </div>
            <div className="metric-tile">
              <strong>Smart</strong>
              <span>Ranking</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-header">
            <p>Spotlight pick</p>
            <span className="trending-badge">AI-ranked</span>
          </div>
          {topRatedService ? (
            <>
              <strong>{topRatedService.name}</strong>
              <span>{topRatedService.provider?.name}</span>
              <p>{topRatedService.description}</p>
              <div className="spotlight-meta">
                <span className="category-chip">Rs. {topRatedService.price}</span>
                <span className="soft-chip">
                  {topRatedService.provider?.city || topRatedService.city}
                </span>
                <span className="distance-chip">
                  {Number(topRatedService.provider?.averageRating || 0).toFixed(1)} rating
                </span>
              </div>
            </>
          ) : (
            <>
              <strong>65% rating + 35% distance</strong>
              <span>Services closer to the customer and rated highly float to the top.</span>
            </>
          )}
        </div>
      </section>

      <div className="trust-bar">
        {TRUST_ITEMS.map((item) => (
          <div key={item} className="trust-item">
            <span className="trust-icon" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <section className="dashboard-card quick-browse-card">
        <p className="label-text">Browse by category</p>
        <div className="category-pills">
          {CATEGORY_LIST.map((category) => (
            <button
              key={category.value}
              className={`category-pill ${activeCategory === category.value ? "active" : ""}`}
              onClick={() => handleCategoryPill(category.value)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <ServiceFilters onSearch={fetchServices} />

      <section>
        <div className="section-heading">
          <span className="eyebrow dark">How it works</span>
        </div>
        <div className="how-it-works">
          {HOW_IT_WORKS.map((item) => (
            <article key={item.step} className="how-step">
              <div className="how-step-icon">{item.step}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

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
      {message && <p className="success-text fade-in">Success: {message}</p>}
      {error && <p className="error-text fade-in">Attention: {error}</p>}

      {services.length ? (
        <section className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </section>
      ) : (
        !loading && (
          <section className="empty-state">
            <h3>No services matched this search</h3>
            <p>Try changing the city, category, or map selection to widen the discovery radius.</p>
          </section>
        )
      )}

      <section className="local-directory-cta">
        <div>
          <span className="eyebrow dark">Local contacts</span>
          <h2>Need offline provider numbers?</h2>
          <p className="muted-text">
            View admin-collected local contacts for providers who are not registered on the site yet.
          </p>
        </div>
        <div className="local-directory-meta">
          <span className="soft-chip">
            {localContacts.length
              ? `${localContacts.length} contacts near ${currentFilters.city || "your area"}`
              : `Directory for ${currentFilters.city || "your area"}`}
          </span>
          <Link className="primary-link" to={auth.user ? "/local-contacts" : "/login"}>
            {auth.user ? "Open local directory" : "Login to view directory"}
          </Link>
        </div>
      </section>

      <section className="provider-layout">
        <section className="dashboard-card editorial-card">
          <h2>Need help finding someone locally?</h2>
          <p className="muted-text">
            Raise a requirement with your area and job details, and the admin field team can line
            up suitable offline contacts around your selected location.
          </p>
          {auth.user ? (
            <form className="grid-form" onSubmit={submitHelpRequest}>
              <label className="field-shell">
                <span>Category</span>
                <select name="category" value={helpForm.category} onChange={handleHelpChange}>
                  <option value="cleaning">Cleaning</option>
                  <option value="cooking">Cooking</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="painting">Painting</option>
                  <option value="appliance repair">Appliance Repair</option>
                </select>
              </label>
              <label className="field-shell">
                <span>Job title</span>
                <input name="title" value={helpForm.title} onChange={handleHelpChange} />
              </label>
              <label className="field-shell full-width">
                <span>What do you need?</span>
                <textarea
                  name="description"
                  value={helpForm.description}
                  onChange={handleHelpChange}
                />
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
                <input name="area" value={helpForm.area} onChange={handleHelpChange} />
              </label>
              <label className="field-shell">
                <span>Contact phone</span>
                <input name="phone" value={helpForm.phone} onChange={handleHelpChange} />
              </label>
              <label className="field-shell full-width">
                <span>Address</span>
                <input name="address" value={helpForm.address} onChange={handleHelpChange} />
              </label>
              <button className="primary-button full-width" type="submit">
                Send help request
              </button>
            </form>
          ) : (
            <section className="empty-state subtle">
              <h3>Login to request local help</h3>
              <p>Users can submit offline help needs once signed in.</p>
              <Link className="primary-link" to="/login">
                Login before continuing
              </Link>
            </section>
          )}
        </section>

        <section className="dashboard-card">
          <h2>Your recent local help requests</h2>
          {helpRequests.length ? (
            <div className="stack-md">
              {helpRequests.map((request) => (
                <article key={request._id} className="review-card">
                  <div className="dashboard-head">
                    <strong>{request.title}</strong>
                    <span className={`status-pill status-${request.status}`}>{request.status}</span>
                  </div>
                  <p>
                    {request.category} | {request.city}
                    {request.area ? ` | ${request.area}` : ""}
                  </p>
                  <p>{request.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <section className="empty-state subtle">
              <h3>No help requests yet</h3>
              <p>Your local support needs will appear here after you submit one.</p>
            </section>
          )}
        </section>
      </section>
    </div>
  );
};

export default HomePage;
