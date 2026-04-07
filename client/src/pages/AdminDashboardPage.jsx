import { useEffect, useMemo, useState } from "react";
import api from "../api/api.js";

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");
      const [
        { data: overviewData },
        { data: userData },
        { data: serviceData },
        { data: bookingData },
        { data: reviewData },
      ] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/users"),
        api.get("/admin/services"),
        api.get("/admin/bookings"),
        api.get("/admin/reviews"),
      ]);

      setOverview(overviewData.data);
      setUsers(userData.data);
      setServices(serviceData.data);
      setBookings(bookingData.data);
      setReviews(reviewData.data);
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

  const renderTab = () => {
    if (activeTab === "users") {
      return (
        <div className="stack-md">
          {users.map((user) => (
            <article key={user._id} className="dashboard-card admin-record">
              <div>
                <strong>{user.name}</strong>
                <p>
                  {user.email} · {user.city || "Unknown city"}
                </p>
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
                <p>
                  {service.category} · {service.provider?.name} · Rs. {service.price}
                </p>
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
                <p>
                  {booking.user?.name} → {booking.provider?.name} ·{" "}
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
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
        {["users", "services", "bookings", "reviews"].map((tab) => (
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
