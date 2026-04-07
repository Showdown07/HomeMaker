import { Link } from "react-router-dom";

const ServiceCard = ({ service }) => {
  const rating = Number(service.provider?.averageRating || 0).toFixed(1);
  const tags = service.tags?.length ? service.tags.slice(0, 2) : ["verified", "priority"];

  return (
    <article className="service-card">
      <div className="service-card-top">
        <span className="category-chip">{service.category}</span>
        {service.distanceMeters !== null && (
          <span className="distance-chip">{(service.distanceMeters / 1000).toFixed(1)} km</span>
        )}
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
      <div className="meta-grid">
        <span>
          <strong>Rs. {service.price}</strong>
        </span>
        <span>{service.provider?.name}</span>
        <span>{service.provider?.city || service.city}</span>
        <span>
          {rating} rating · {service.provider?.totalReviews || 0} reviews
        </span>
      </div>
      <div className="service-card-actions">
        <Link className="ghost-link" to={`/services/${service._id}`}>
          Explore
        </Link>
        <Link className="primary-link" to={`/book/${service._id}`}>
          Reserve Slot
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
