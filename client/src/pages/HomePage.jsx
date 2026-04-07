import { useEffect, useState } from "react";
import api from "../api/api.js";
import ServiceCard from "../components/ServiceCard.jsx";
import ServiceFilters from "../components/ServiceFilters.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const HomePage = () => {
  const { auth } = useAuth();
  const [services, setServices] = useState([]);
  const [localContacts, setLocalContacts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
      const [{ data: serviceData }, { data: contactData }] = await Promise.all([
        api.get("/services", { params }),
        api.get("/local-contacts", {
          params: {
            city: params.city,
            pincode: params.pincode,
            category: params.category,
          },
        }),
      ]);
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
    fetchServices({
      city: "Bengaluru",
      lat: "12.9716",
      lng: "77.5946",
    });
  }, []);

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

  const topRatedService = services[0];

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

  return (
    <div className="stack-xl">
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
            <p>Spotlight pick</p>
            <span>AI-ranked</span>
          </div>
          {topRatedService ? (
            <>
              <strong>{topRatedService.name}</strong>
              <span>{topRatedService.provider?.name}</span>
              <p>{topRatedService.description}</p>
              <div className="spotlight-meta">
                <span>Rs. {topRatedService.price}</span>
                <span>{topRatedService.provider?.city || topRatedService.city}</span>
                <span>{Number(topRatedService.provider?.averageRating || 0).toFixed(1)} rating</span>
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

      <ServiceFilters onSearch={fetchServices} />

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

      {loading && <p className="muted-text">Loading services...</p>}
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

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

      {localContacts.length ? (
        <section className="service-grid compact-grid">
          {localContacts.map((contact) => (
            <article className="service-card compact-card" key={contact._id}>
              <div className="service-card-top">
                <span className="category-chip">{contact.category}</span>
                <span className="soft-chip">{contact.area || contact.city}</span>
              </div>
              <h3>{contact.name}</h3>
              <p>{contact.notes || "Trusted local contact collected by the admin field team."}</p>
              <div className="meta-grid">
                <span>
                  <strong>{contact.phone}</strong>
                </span>
                <span>{contact.alternatePhone || "No alternate number"}</span>
                <span>{contact.city}</span>
                <span>{contact.pincode || "No pincode"}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        !loading && (
          <section className="empty-state subtle">
            <h3>No local helpline contacts for this area</h3>
            <p>
              The admin field directory has no extra contacts for {currentFilters.city || "this area"}
              yet.
            </p>
          </section>
        )
      )}

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
                Send Help Request
              </button>
            </form>
          ) : (
            <section className="empty-state subtle">
              <h3>Login to request local help</h3>
              <p>Users can submit offline help needs once signed in.</p>
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
                  <p>{request.category} | {request.city}{request.area ? ` | ${request.area}` : ""}</p>
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
