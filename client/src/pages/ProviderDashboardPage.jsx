import { useEffect, useState } from "react";
import api from "../api/api.js";
import BookingChat from "../components/BookingChat.jsx";

const emptyService = {
  name: "",
  description: "",
  category: "cleaning",
  price: "",
  durationMinutes: "60",
  city: "Bengaluru",
  pincode: "560001",
  tags: "",
};

const defaultAvailability = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isActive: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isActive: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isActive: true },
];

const ProviderDashboardPage = () => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyService);
  const [availability, setAvailability] = useState(defaultAvailability);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [{ data: serviceData }, { data: bookingData }, { data: profileData }] = await Promise.all([
      api.get("/services/provider/me"),
      api.get("/bookings"),
      api.get("/auth/me"),
    ]);

    setServices(serviceData.data);
    setBookings(bookingData.data);
    setAvailability(profileData.data.availability?.length ? profileData.data.availability : defaultAvailability);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleServiceChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const createService = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await api.post("/services", {
        ...form,
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setForm(emptyService);
      setMessage("Service created successfully.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create service");
    }
  };

  const updateStatus = async (bookingId, status) => {
    await api.put(`/bookings/${bookingId}/status`, { status });
    loadData();
  };

  const cancelBooking = async (bookingId) => {
    try {
      setError("");
      await api.put(`/bookings/${bookingId}/cancel`);
      setMessage("Booking cancelled.");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel booking");
    }
  };

  const updateAvailabilityField = (index, field, value) => {
    setAvailability((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: field === "dayOfWeek" ? Number(value) : value } : slot
      )
    );
  };

  const saveAvailability = async () => {
    try {
      setError("");
      await api.put("/providers/availability/me", { availability });
      setMessage("Availability updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update availability");
    }
  };

  const stats = {
    services: services.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
  };

  return (
    <div className="stack-xl">
      <section className="section-header">
        <div>
          <span className="eyebrow dark">Provider control center</span>
          <h1>Manage services, schedule, and live bookings</h1>
        </div>
        <div className="hero-metrics compact">
          <div className="metric-tile">
            <strong>{stats.services}</strong>
            <span>Services</span>
          </div>
          <div className="metric-tile">
            <strong>{stats.pending}</strong>
            <span>Pending</span>
          </div>
          <div className="metric-tile">
            <strong>{stats.completed}</strong>
            <span>Completed</span>
          </div>
        </div>
      </section>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="provider-layout">
        <section className="dashboard-card editorial-card">
          <h2>Add a service</h2>
          <p className="muted-text">Create tightly scoped offers with a clear price, duration, and service promise.</p>
          <form className="grid-form" onSubmit={createService}>
            <label className="field-shell">
              <span>Service name</span>
              <input name="name" placeholder="Service name" value={form.name} onChange={handleServiceChange} />
            </label>
            <label className="field-shell">
              <span>Price</span>
              <input name="price" placeholder="Price" value={form.price} onChange={handleServiceChange} />
            </label>
            <label className="field-shell">
              <span>Category</span>
              <select name="category" value={form.category} onChange={handleServiceChange}>
                <option value="cleaning">Cleaning</option>
                <option value="cooking">Cooking</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="painting">Painting</option>
                <option value="appliance repair">Appliance Repair</option>
              </select>
            </label>
            <label className="field-shell">
              <span>Duration</span>
              <input
                name="durationMinutes"
                placeholder="Duration in minutes"
                value={form.durationMinutes}
                onChange={handleServiceChange}
              />
            </label>
            <label className="field-shell">
              <span>City</span>
              <input name="city" placeholder="City" value={form.city} onChange={handleServiceChange} />
            </label>
            <label className="field-shell">
              <span>Pincode</span>
              <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleServiceChange} />
            </label>
            <label className="field-shell full-width">
              <span>Description</span>
              <textarea
                className="full-width"
                name="description"
                placeholder="Describe the service"
                value={form.description}
                onChange={handleServiceChange}
              />
            </label>
            <label className="field-shell full-width">
              <span>Tags</span>
              <input
                className="full-width"
                name="tags"
                placeholder="Comma separated tags"
                value={form.tags}
                onChange={handleServiceChange}
              />
            </label>
            <button className="primary-button full-width" type="submit">
              Create Service
            </button>
          </form>
        </section>

        <section className="dashboard-card editorial-card">
          <h2>Weekly availability</h2>
          <p className="muted-text">Turn your weekly rhythm into bookable windows your customers can trust.</p>
          <div className="stack-md">
            {availability.map((slot, index) => (
              <div className="availability-card" key={`${slot.dayOfWeek}-${index}`}>
                <select
                  value={slot.dayOfWeek}
                  onChange={(event) => updateAvailabilityField(index, "dayOfWeek", event.target.value)}
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
                <div className="availability-times">
                  <input
                    value={slot.startTime}
                    onChange={(event) => updateAvailabilityField(index, "startTime", event.target.value)}
                  />
                  <input
                    value={slot.endTime}
                    onChange={(event) => updateAvailabilityField(index, "endTime", event.target.value)}
                  />
                </div>
              </div>
            ))}
            <button className="primary-button" onClick={saveAvailability}>
              Save Availability
            </button>
          </div>
        </section>
      </div>

      <section className="dashboard-card">
        <h2>Your services</h2>
        {services.length ? (
          <div className="service-grid compact-grid">
            {services.map((service) => (
              <article className="service-card compact-card" key={service._id}>
                <div className="service-card-top">
                  <span className="category-chip">{service.category}</span>
                  <span className="soft-chip">Rs. {service.price}</span>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <section className="empty-state subtle">
            <h3>No services yet</h3>
            <p>Create your first offer to start receiving bookings.</p>
          </section>
        )}
      </section>

      <section className="dashboard-card">
        <h2>Incoming bookings</h2>
        {bookings.length ? (
          <div className="stack-md">
            {bookings.map((booking) => (
              <div className="list-row cardish booking-ops-card" key={booking._id}>
                <div>
                  <strong>{booking.service?.name}</strong>
                  <p>
                    {booking.user?.name} | {new Date(booking.bookingDate).toLocaleDateString()} | {booking.slotStart}-{booking.slotEnd}
                  </p>
                </div>
                <div className="row-actions">
                  <span className={`status-pill status-${booking.status}`}>{booking.status}</span>
                  {!["completed", "cancelled"].includes(booking.status) && (
                    <>
                      <button className="ghost-button" onClick={() => updateStatus(booking._id, "confirmed")}>
                        Confirm
                      </button>
                      <button className="ghost-button" onClick={() => updateStatus(booking._id, "completed")}>
                        Complete
                      </button>
                      <button className="ghost-button" onClick={() => cancelBooking(booking._id)}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                {!["completed", "cancelled"].includes(booking.status) && (
                  <BookingChat bookingId={booking._id} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <section className="empty-state subtle">
            <h3>No live bookings</h3>
            <p>New requests will appear here the moment a customer reserves a slot.</p>
          </section>
        )}
      </section>
    </div>
  );
};

export default ProviderDashboardPage;
