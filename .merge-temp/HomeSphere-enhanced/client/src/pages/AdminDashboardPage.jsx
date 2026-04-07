import { useEffect, useMemo, useState } from "react";
import api from "../api/api.js";

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [localContacts, setLocalContacts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingContactId, setEditingContactId] = useState(null);
  const [editContactForm, setEditContactForm] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    category: "plumber",
    phone: "",
    alternatePhone: "",
    city: "Bengaluru",
    pincode: "560001",
    area: "",
    address: "",
    notes: "",
  });

  const loadData = async () => {
    try {
      setError("");
      const [
        { data: overviewData },
        { data: userData },
        { data: serviceData },
        { data: bookingData },
        { data: reviewData },
        { data: localContactData },
        { data: helpRequestData },
      ] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/users"),
        api.get("/admin/services"),
        api.get("/admin/bookings"),
        api.get("/admin/reviews"),
        api.get("/admin/local-contacts"),
        api.get("/admin/help-requests"),
      ]);

      setOverview(overviewData.data);
      setUsers(userData.data);
      setServices(serviceData.data);
      setBookings(bookingData.data);
      setReviews(reviewData.data);
      setLocalContacts(localContactData.data);
      setHelpRequests(helpRequestData.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin dashboard");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const bookingStatusMap = useMemo(() => {
    const map = new Map();
    overview?.bookingStatusCounts?.forEach((item) => {
      map.set(item._id, item.count);
    });
    return map;
  }, [overview]);

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setMessage("User role updated.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user role");
    }
  };

  const toggleService = async (serviceId, isActive) => {
    try {
      await api.put(`/admin/services/${serviceId}/status`, { isActive: !isActive });
      setMessage("Service status updated.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update service status");
    }
  };

  const handleContactChange = (event) => {
    setContactForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const createLocalDirectoryContact = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await api.post("/admin/local-contacts", contactForm);
      setMessage("Local helpline contact added.");
      setContactForm({
        name: "",
        category: "plumber",
        phone: "",
        alternatePhone: "",
        city: "Bengaluru",
        pincode: "560001",
        area: "",
        address: "",
        notes: "",
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add local contact");
    }
  };

  const startEditingLocalContact = (contact) => {
    setEditingContactId(contact._id);
    setEditContactForm({
      name: contact.name || "",
      category: contact.category || "plumber",
      phone: contact.phone || "",
      alternatePhone: contact.alternatePhone || "",
      city: contact.city || "Bengaluru",
      pincode: contact.pincode || "",
      area: contact.area || "",
      address: contact.address || "",
      notes: contact.notes || "",
    });
  };

  const cancelEditingLocalContact = () => {
    setEditingContactId(null);
    setEditContactForm(null);
  };

  const handleEditContactChange = (event) => {
    setEditContactForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const saveEditedLocalContact = async (contactId) => {
    try {
      setError("");
      await api.put(`/admin/local-contacts/${contactId}`, editContactForm);
      setMessage("Local helpline contact updated.");
      cancelEditingLocalContact();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update local contact");
    }
  };

  const removeLocalDirectoryContact = async (contactId) => {
    try {
      setError("");
      await api.delete(`/admin/local-contacts/${contactId}`);
      setMessage("Local helpline contact removed.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove local contact");
    }
  };

  const updateHelpRequest = async (requestId, status) => {
    try {
      setError("");
      await api.put(`/admin/help-requests/${requestId}/status`, { status });
      setMessage("Help request status updated.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update help request");
    }
  };

  const renderTab = () => {
    if (activeTab === "users") {
      return (
        <div className="stack-md">
          {users.map((user) => (
            <article key={user._id} className="dashboard-card admin-record">
              <div>
                <strong>{user.name}</strong>
                <p>{user.email} | {user.city || "Unknown city"}</p>
              </div>
              <div className="row-actions">
                <span className="status-pill">{user.role}</span>
                <select value={user.role} onChange={(event) => updateRole(user._id, event.target.value)}>
                  <option value="user">User</option>
                  <option value="provider">Provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === "services") {
      return (
        <div className="stack-md">
          {services.map((service) => (
            <article key={service._id} className="dashboard-card admin-record">
              <div>
                <strong>{service.name}</strong>
                <p>{service.category} | {service.provider?.name} | Rs. {service.price}</p>
              </div>
              <div className="row-actions">
                <span className={`status-pill ${service.isActive ? "status-completed" : ""}`}>
                  {service.isActive ? "active" : "inactive"}
                </span>
                <button className="ghost-button" onClick={() => toggleService(service._id, service.isActive)}>
                  {service.isActive ? "Archive" : "Restore"}
                </button>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === "bookings") {
      return (
        <div className="stack-md">
          {bookings.map((booking) => (
            <article key={booking._id} className="dashboard-card admin-record">
              <div>
                <strong>{booking.service?.name}</strong>
                <p>{booking.user?.name} to {booking.provider?.name} | {new Date(booking.bookingDate).toLocaleDateString()}</p>
              </div>
              <div className="row-actions">
                <span className={`status-pill status-${booking.status}`}>{booking.status}</span>
                <span className="soft-chip">{booking.payment?.status}</span>
              </div>
            </article>
          ))}
        </div>
      );
    }

    if (activeTab === "directory") {
      return (
        <div className="provider-layout">
          <section className="dashboard-card editorial-card">
            <h2>Add local helpline contact</h2>
            <p className="muted-text">
              Add field-collected contacts for trusted providers who are not yet registered on the platform.
            </p>
            <form className="grid-form" onSubmit={createLocalDirectoryContact}>
              <label className="field-shell">
                <span>Name</span>
                <input name="name" value={contactForm.name} onChange={handleContactChange} />
              </label>
              <label className="field-shell">
                <span>Category</span>
                <select name="category" value={contactForm.category} onChange={handleContactChange}>
                  <option value="cleaning">Cleaning</option>
                  <option value="cooking">Cooking</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumber">Plumber</option>
                  <option value="painting">Painting</option>
                  <option value="appliance repair">Appliance Repair</option>
                </select>
              </label>
              <label className="field-shell">
                <span>Phone</span>
                <input name="phone" value={contactForm.phone} onChange={handleContactChange} />
              </label>
              <label className="field-shell">
                <span>Alternate phone</span>
                <input
                  name="alternatePhone"
                  value={contactForm.alternatePhone}
                  onChange={handleContactChange}
                />
              </label>
              <label className="field-shell">
                <span>City</span>
                <input name="city" value={contactForm.city} onChange={handleContactChange} />
              </label>
              <label className="field-shell">
                <span>Pincode</span>
                <input name="pincode" value={contactForm.pincode} onChange={handleContactChange} />
              </label>
              <label className="field-shell">
                <span>Area</span>
                <input name="area" value={contactForm.area} onChange={handleContactChange} />
              </label>
              <label className="field-shell full-width">
                <span>Address</span>
                <input name="address" value={contactForm.address} onChange={handleContactChange} />
              </label>
              <label className="field-shell full-width">
                <span>Notes</span>
                <textarea name="notes" value={contactForm.notes} onChange={handleContactChange} />
              </label>
              <button className="primary-button full-width" type="submit">
                Save Local Contact
              </button>
            </form>
          </section>

          <section className="dashboard-card">
            <h2>Field directory</h2>
            <div className="stack-md">
              {localContacts.map((contact) => (
                <article key={contact._id} className="review-card">
                  {editingContactId === contact._id ? (
                    <div className="stack-md">
                      <div className="grid-form">
                        <label className="field-shell">
                          <span>Name</span>
                          <input
                            name="name"
                            value={editContactForm?.name || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                        <label className="field-shell">
                          <span>Category</span>
                          <select
                            name="category"
                            value={editContactForm?.category || "plumber"}
                            onChange={handleEditContactChange}
                          >
                            <option value="cleaning">Cleaning</option>
                            <option value="cooking">Cooking</option>
                            <option value="electrician">Electrician</option>
                            <option value="plumber">Plumber</option>
                            <option value="painting">Painting</option>
                            <option value="appliance repair">Appliance Repair</option>
                          </select>
                        </label>
                        <label className="field-shell">
                          <span>Phone</span>
                          <input
                            name="phone"
                            value={editContactForm?.phone || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                        <label className="field-shell">
                          <span>Alternate phone</span>
                          <input
                            name="alternatePhone"
                            value={editContactForm?.alternatePhone || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                        <label className="field-shell">
                          <span>City</span>
                          <input
                            name="city"
                            value={editContactForm?.city || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                        <label className="field-shell">
                          <span>Pincode</span>
                          <input
                            name="pincode"
                            value={editContactForm?.pincode || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                        <label className="field-shell">
                          <span>Area</span>
                          <input
                            name="area"
                            value={editContactForm?.area || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                        <label className="field-shell full-width">
                          <span>Address</span>
                          <input
                            name="address"
                            value={editContactForm?.address || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                        <label className="field-shell full-width">
                          <span>Notes</span>
                          <textarea
                            name="notes"
                            value={editContactForm?.notes || ""}
                            onChange={handleEditContactChange}
                          />
                        </label>
                      </div>
                      <div className="row-actions">
                        <button
                          className="primary-button"
                          onClick={() => saveEditedLocalContact(contact._id)}
                        >
                          Save Changes
                        </button>
                        <button className="ghost-button" onClick={cancelEditingLocalContact}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="dashboard-head">
                        <strong>{contact.name}</strong>
                        <span className="status-pill">{contact.category}</span>
                      </div>
                      <p>{contact.area || contact.city} | {contact.phone}</p>
                      <p>{contact.notes || "No extra notes provided."}</p>
                      <div className="row-actions">
                        <button
                          className="ghost-button"
                          onClick={() => startEditingLocalContact(contact)}
                        >
                          Edit
                        </button>
                        <button
                          className="ghost-button"
                          onClick={() => removeLocalDirectoryContact(contact._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "help requests") {
      return (
        <div className="stack-md">
          {helpRequests.length ? (
            helpRequests.map((request) => (
              <article key={request._id} className="dashboard-card admin-record">
                <div>
                  <strong>{request.title}</strong>
                  <p>
                    {request.user?.name} | {request.category} | {request.city}
                    {request.area ? ` | ${request.area}` : ""}
                  </p>
                  <p>{request.description}</p>
                </div>
                <div className="row-actions">
                  <span className={`status-pill status-${request.status}`}>{request.status}</span>
                  <select
                    value={request.status}
                    onChange={(event) => updateHelpRequest(request._id, event.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </article>
            ))
          ) : (
            <section className="empty-state subtle">
              <h3>No help requests yet</h3>
              <p>User-raised local needs will appear here for review.</p>
            </section>
          )}
        </div>
      );
    }

    return (
      <div className="stack-md">
        {reviews.map((review) => (
          <article key={review._id} className="dashboard-card admin-record">
            <div>
              <strong>{review.service?.name}</strong>
              <p>
                {review.user?.name} reviewed {review.provider?.name}
              </p>
            </div>
            <div className="row-actions">
              <span className="status-pill">{review.rating}/5</span>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="stack-xl">
      <section className="section-header">
        <div>
          <span className="eyebrow dark">Admin console</span>
          <h1>Platform command center</h1>
        </div>
        <div className="hero-metrics compact">
          <div className="metric-tile">
            <strong>{overview?.stats?.users || 0}</strong>
            <span>Users</span>
          </div>
          <div className="metric-tile">
            <strong>{overview?.stats?.providers || 0}</strong>
            <span>Providers</span>
          </div>
          <div className="metric-tile">
            <strong>{overview?.stats?.services || 0}</strong>
            <span>Services</span>
          </div>
          <div className="metric-tile">
            <strong>{overview?.stats?.bookings || 0}</strong>
            <span>Bookings</span>
          </div>
        </div>
      </section>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <section className="section-banner">
        <div>
          <span className="eyebrow dark">Operations overview</span>
          <h2>Booking flow health</h2>
        </div>
        <div className="hero-metrics compact">
          <div className="metric-tile">
            <strong>{bookingStatusMap.get("pending") || 0}</strong>
            <span>Pending</span>
          </div>
          <div className="metric-tile">
            <strong>{bookingStatusMap.get("confirmed") || 0}</strong>
            <span>Confirmed</span>
          </div>
          <div className="metric-tile">
            <strong>{bookingStatusMap.get("completed") || 0}</strong>
            <span>Completed</span>
          </div>
          <div className="metric-tile">
            <strong>{overview?.stats?.reviews || 0}</strong>
            <span>Reviews</span>
          </div>
        </div>
      </section>

      <div className="admin-tabs">
        {["users", "services", "bookings", "reviews", "directory", "help requests"].map((tab) => (
          <button
            key={tab}
            className={`ghost-button ${activeTab === tab ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
};

export default AdminDashboardPage;
