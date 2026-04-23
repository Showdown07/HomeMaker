import { Link } from "react-router-dom";

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);

  for (let index = 1; index <= 5; index += 1) {
    stars.push(
      <span key={index} className={`star ${index <= fullStars ? "" : "empty"}`}>
        ★
      </span>,
    );
  }

  return <div className="star-rating">{stars}</div>;
};

const ServiceCard = ({ service }) => {
  const numericRating = Number(service.provider?.averageRating || 0);
  const rating = numericRating.toFixed(1);
  const tags = service.tags?.length ? service.tags.slice(0, 2) : ["verified", "priority"];
  const isTrending = numericRating >= 4.5 && (service.provider?.totalReviews || 0) >= 5;

  return (
    <article className="service-card fade-in">
      <div className="service-card-top">
        <span className="category-chip">{service.category}</span>
        <div className="service-card-badges">
          {isTrending && <span className="trending-badge">Popular</span>}
          {service.distanceMeters !== null && service.distanceMeters !== undefined && (
            <span className="distance-chip">{(service.distanceMeters / 1000).toFixed(1)} km</span>
          )}
        </div>
      </div>

      <h3>{service.name}</h3>
      <p>{service.description}</p>

      <div className="tag-row">
        {tags.map((tag) => (
          <span key={tag} className="soft-chip">
            {tag}
          </span>
        ))}
      </div>

      <div className="service-card-rating">
        <StarRating rating={numericRating} />
        <span>
          {rating} rating | {service.provider?.totalReviews || 0} reviews
        </span>
      </div>

      <div className="meta-grid">
        <span>
          <strong>Rs. {service.price}</strong>
          <small className="meta-note">/visit</small>
        </span>
        <span>{service.provider?.name || "Provider pending"}</span>
        <span>{service.provider?.city || service.city}</span>
        <span>{service.durationMinutes || 60} min</span>
      </div>

      <div className="service-card-actions">
        <Link className="ghost-link" to={`/services/${service._id}`}>
          View details
        </Link>
        <Link className="primary-link" to={`/book/${service._id}`}>
          Reserve Slot
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
