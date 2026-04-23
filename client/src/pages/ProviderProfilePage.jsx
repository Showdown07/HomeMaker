import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api.js";
import ServiceCard from "../components/ServiceCard.jsx";

const ProviderProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get(`/providers/${id}`);
        setProfile(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load provider profile");
      }
    };

    loadProfile();
  }, [id]);

  if (error) return <p className="error-text">{error}</p>;
  if (!profile) return <p className="muted-text">Loading provider profile...</p>;

  const { provider, services, reviews } = profile;

  return (
    <div className="stack-xl">
      <section className="details-hero">
        <div className="details-story">
          <span className="eyebrow">Provider profile</span>
          <h1>{provider.name}</h1>
          <p>{provider.bio || "Verified home-service professional on HomeSphere."}</p>
          <div className="tag-row">
            {(provider.skills?.length ? provider.skills : ["verified", "local", "available"]).map((skill) => (
              <span className="soft-chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>
        <aside className="details-sidepanel">
          <h3>Trust snapshot</h3>
          <div className="summary-list">
            <span>{Number(provider.averageRating || 0).toFixed(1)} rating</span>
            <span>{provider.totalReviews || 0} reviews</span>
            <span>{provider.city || "Location pending"}</span>
            <span>{services.length} live services</span>
          </div>
          <Link className="primary-link full-width" to="/">
            Browse services
          </Link>
        </aside>
      </section>

      <section className="dashboard-card">
        <h2>Services by {provider.name}</h2>
        {services.length ? (
          <div className="service-grid compact-grid">
            {services.map((service) => (
              <ServiceCard key={service._id} service={{ ...service, provider }} />
            ))}
          </div>
        ) : (
          <section className="empty-state subtle">
            <h3>No active services</h3>
            <p>This provider has not published a service yet.</p>
          </section>
        )}
      </section>

      <section className="dashboard-card">
        <h2>Reviews</h2>
        {reviews.length ? (
          <div className="stack-md">
            {reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <div className="dashboard-head">
                  <strong>{review.user?.name || "Customer"}</strong>
                  <span className="status-pill">{review.rating}/5</span>
                </div>
                <p>{review.comment || "No written feedback provided."}</p>
              </article>
            ))}
          </div>
        ) : (
          <section className="empty-state subtle">
            <h3>No reviews yet</h3>
            <p>Customer feedback will appear here after completed bookings.</p>
          </section>
        )}
      </section>
    </div>
  );
};

export default ProviderProfilePage;
