import { useEffect, useState } from "react";
import api from "../api/api.js";

const UserDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [reviewForm, setReviewForm] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadBookings = async () => {
    try {
      const { data } = await api.get("/bookings");
      setBookings(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch bookings");
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const submitReview = async (bookingId) => {
    const values = reviewForm[bookingId];
    if (!values?.rating) return;
    await api.post("/reviews", {
      bookingId,
      rating: Number(values.rating),
      comment: values.comment,
    });
    setMessage("Review submitted successfully.");
    await loadBookings();
  };

  const setBookingReview = (bookingId, field, value) => {
    setReviewForm((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        [field]: value,
      },
    }));
  };

  const stats = {
    total: bookings.length,
    active: bookings.filter((booking) => ["pending", "confirmed", "in-progress"].includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
  };

  return (
    <div className="stack-xl">
      <section className="section-header">
        <div>
          <span className="eyebrow dark">User dashboard</span>
          <h1>Your bookings</h1>
        </div>
        <div className="hero-metrics compact">
          <div className="metric-tile">
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>
          <div className="metric-tile">
            <strong>{stats.active}</strong>
            <span>Active</span>
          </div>
          <div className="metric-tile">
            <strong>{stats.completed}</strong>
            <span>Completed</span>
          </div>
        </div>
      </section>
      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}
      <div className="stack-lg">
        {bookings.length ? (
          bookings.map((booking) => (
            <article key={booking._id} className="dashboard-card booking-card-row">
              <div className="dashboard-head">
                <div>
                  <h3>{booking.service?.name}</h3>
                  <p>
                    {new Date(booking.bookingDate).toLocaleDateString()} · {booking.slotStart} - {booking.slotEnd}
                  </p>
                </div>
                <span className={`status-pill status-${booking.status}`}>{booking.status}</span>
              </div>
              <div className="booking-insights">
                <div>
                  <span className="label-text">Provider</span>
                  <strong>{booking.provider?.name}</strong>
                </div>
                <div>
                  <span className="label-text">Payment</span>
                  <strong>{booking.payment?.status}</strong>
                </div>
                <div>
                  <span className="label-text">Address</span>
                  <strong>{booking.address}</strong>
                </div>
              </div>
              {booking.status === "completed" && (
                <div className="review-panel">
                  <h4>Leave a finishing note</h4>
                  <div className="review-form">
                    <input
                      placeholder="Rating out of 5"
                      value={reviewForm[booking._id]?.rating || ""}
                      onChange={(event) => setBookingReview(booking._id, "rating", event.target.value)}
                    />
                    <input
                      placeholder="What stood out?"
                      value={reviewForm[booking._id]?.comment || ""}
                      onChange={(event) => setBookingReview(booking._id, "comment", event.target.value)}
                    />
                    <button className="primary-button" onClick={() => submitReview(booking._id)}>
                      Submit Review
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))
        ) : (
          <section className="empty-state">
            <h3>No bookings yet</h3>
            <p>Your upcoming services will appear here once you reserve your first slot.</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
