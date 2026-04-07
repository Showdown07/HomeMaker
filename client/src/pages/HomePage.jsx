import { useEffect, useState } from "react";
import api from "../api/api.js";
import ServiceCard from "../components/ServiceCard.jsx";
import ServiceFilters from "../components/ServiceFilters.jsx";

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await api.get("/services", { params });
      setServices(data.data);
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

  const topRatedService = services[0];

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

      {loading && <p className="muted-text">Loading services...</p>}
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
    </div>
  );
};

export default HomePage;
