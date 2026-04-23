import { useEffect, useState } from "react";
import api from "../api/api.js";

const LocalContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [filters, setFilters] = useState({
    city: "Bengaluru",
    pincode: "",
    category: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadContacts = async (params = filters) => {
    try {
      setLoading(true);
      const { data } = await api.get("/local-contacts", { params });
      setContacts(data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load local contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadContacts(filters);
  };

  return (
    <div className="stack-xl">
      <section className="section-header">
        <div>
          <span className="eyebrow dark">Local contacts</span>
          <h1>Offline provider directory</h1>
          <p className="muted-text">
            Field-collected local providers who are not registered on HomeSphere yet.
          </p>
        </div>
      </section>

      <form className="filter-bar filter-panel local-filter-panel" onSubmit={handleSubmit}>
        <label className="field-shell">
          <span>City</span>
          <input name="city" value={filters.city} onChange={handleChange} />
        </label>
        <label className="field-shell">
          <span>Pincode</span>
          <input name="pincode" value={filters.pincode} onChange={handleChange} />
        </label>
        <label className="field-shell">
          <span>Category</span>
          <select name="category" value={filters.category} onChange={handleChange}>
            <option value="">All Categories</option>
            <option value="cleaning">Cleaning</option>
            <option value="cooking">Cooking</option>
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="painting">Painting</option>
            <option value="appliance repair">Appliance Repair</option>
          </select>
        </label>
        <button className="primary-button tall-button" type="submit">
          Search Directory
        </button>
      </form>

      {loading && <div className="loading-bar" />}
      {error && <p className="error-text">{error}</p>}

      {contacts.length ? (
        <section className="service-grid compact-grid">
          {contacts.map((contact) => (
            <article className="compact-card local-contact-card" key={contact._id}>
              <div className="service-card-top">
                <span className="category-chip">{contact.category}</span>
                <span className="soft-chip">{contact.area || contact.city}</span>
              </div>
              <div className="provider-card-mini">
                <div className="provider-avatar">{contact.name.slice(0, 1).toUpperCase()}</div>
                <div className="stack-xs">
                  <strong>{contact.name}</strong>
                  <span className="muted-text">
                    {contact.notes || "Field-verified local contact collected by the admin team."}
                  </span>
                </div>
              </div>
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
          <section className="empty-state">
            <h3>No local contacts found</h3>
            <p>Try changing city, pincode, or category.</p>
          </section>
        )
      )}
    </div>
  );
};

export default LocalContactsPage;
