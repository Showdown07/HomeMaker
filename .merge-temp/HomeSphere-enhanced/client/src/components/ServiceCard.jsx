import { Link } from "react-router-dom";

const StarRating = ({ rating }) => {
  const stars = [];
  const full = Math.floor(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`star ${i <= full ? "" : "empty"}`}>★</span>
    );
  }
  return <div className="star-rating">{stars}</div>;
};

const ServiceCard = ({ service }) => {
  const rating = Number(service.provider?.averageRating || 0);
  const ratingDisplay = rating.toFixed(1);
  const tags = service.tags?.length ? service.tags.slice(0, 2) : ["verified", "priority"];
  const isTrending = rating >= 4.5 && (service.provider?.totalReviews || 0) >= 5;

  return (
    <article className="service-card fade-in">
      <div className="service-card-top">
        <span className="category-chip">{service.category}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isTrending && <span className="trending-badge">🔥 Popular</span>}
          {service.distanceMeters !== null && service.distanceMeters !== undefined && (
            <span className="distance-chip">📍 {(service.distanceMeters / 1000).toFixed(1)} km</span>
          )}
        </div>
      </div>

      <h3>{service.name}</h3>
      <p style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>{service.description}</p>

      <div className="tag-row">
        {tags.map((tag) => (
          <span key={tag} className="soft-chip">{tag}</span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.1rem" }}>
        <StarRating rating={rating} />
        <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
          {ratingDisplay} · {service.provider?.totalReviews || 0} reviews
        </span>
      </div>

      <div className="meta-grid">
        <span>
          <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--brand-deep)" }}>
            ₹{service.price}
          </strong>
          <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>/visit</span>
        </span>
        <span>{service.provider?.name || "—"}</span>
        <span>📌 {service.provider?.city || service.city || "—"}</span>
        <span>⏱ {service.durationMinutes || 60} min</span>
      </div>

      <div className="service-card-actions">
        <Link className="ghost-link" to={`/services/${service._id}`}>
          View Details
        </Link>
        <Link className="primary-link" to={`/book/${service._id}`}>
          Reserve Slot →
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
