import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api.js";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await api.get(`/services/${id}`);
        setService(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load service details");
      }
    };

    fetchService();
  }, [id]);

  if (error) return <p className="error-text">{error}</p>;
  if (!service) return <p>Loading service details...</p>;

  const providerRating = Number(service.provider?.averageRating || 0).toFixed(1);
  const reviewCount = service.provider?.totalReviews || 0;
  const serviceTags = service.tags?.length ? service.tags : ["verified", "scheduled", "insured"];

  return (
    <div className="stack-xl">
      <section className="details-hero">
        <div className="details-story">
          <span className="eyebrow">Service profile</span>
          <span className="category-chip">{service.category}</span>
          <h1>{service.name}</h1>
          <p>{service.description}</p>
          <div className="tag-row">
            {serviceTags.map((tag) => (
              <span key={tag} className="soft-chip">
                {tag}
              </span>
            ))}
          </div>
          <div className="hero-metrics compact">
            <div className="metric-tile">
              <strong>Rs. {service.price}</strong>
              <span>Starting price</span>
            </div>
            <div className="metric-tile">
              <strong>{service.durationMinutes} mins</strong>
              <span>Average duration</span>
            </div>
            <div className="metric-tile">
              <strong>{providerRating}</strong>
              <span>{reviewCount} reviews</span>
            </div>
          </div>
        </div>

        <div className="details-sidepanel">
          <h3>Why customers pick this</h3>
          <div className="summary-list">
            <span>{service.provider?.name}</span>
            <span>{service.city}</span>
            <span>AI-ranked nearby</span>
            <span>Live booking available</span>
          </div>
          <Link className="primary-link full-width" to={`/book/${service._id}`}>
            Continue to Booking
          </Link>
        </div>
      </section>

      <div className="details-layout">
        <section className="details-card">
          <h2>Provider profile</h2>
          <div className="provider-highlight">
            <div className="dashboard-head">
              <div>
                <strong>{service.provider?.name}</strong>
                <p>{service.provider?.city || service.city}</p>
              </div>
              <span className="status-pill">{providerRating} rating</span>
            </div>
            <p>{service.provider?.bio || "Verified professional available for on-demand services."}</p>
            <div className="booking-insights">
              <div>
                <span className="label-text">Reviews</span>
                <strong>{reviewCount}</strong>
              </div>
              <div>
                <span className="label-text">Category</span>
                <strong>{service.category}</strong>
              </div>
              <div>
                <span className="label-text">Location</span>
                <strong>{service.city}</strong>
              </div>
            </div>
            <Link className="ghost-link" to={`/providers/${service.provider?._id}`}>
              View full provider profile
            </Link>
          </div>
        </section>

        <section className="details-card">
          <h2>Customer reviews</h2>
          <div className="stack-md">
            {service.reviews?.length ? (
              service.reviews.map((review) => (
                <article className="review-card" key={review._id}>
                  <div className="dashboard-head">
                    <strong>{review.user?.name}</strong>
                    <span className="status-pill">{review.rating}/5</span>
                  </div>
                  <p>{review.comment || "No written feedback provided."}</p>
                </article>
              ))
            ) : (
              <section className="empty-state subtle">
                <h3>No reviews yet</h3>
                <p>The first customer review will appear here after a completed booking.</p>
              </section>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
