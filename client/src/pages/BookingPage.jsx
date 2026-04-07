import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api.js";

const timeSlots = [
  ["09:00", "10:00"],
  ["10:00", "11:00"],
  ["11:00", "12:00"],
  ["14:00", "15:00"],
  ["15:00", "16:00"],
  ["16:00", "17:00"],
];

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    bookingDate: "",
    slotStart: "10:00",
    slotEnd: "11:00",
    address: "",
    city: "Bengaluru",
    pincode: "560001",
    notes: "",
  });

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await api.get(`/services/${id}`);
      setService(data.data);
    };

    fetchService();
  }, [id]);

  const handleChange = (event) => {
    setError("");
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSlotPick = ([slotStart, slotEnd]) => {
    setError("");
    setForm((current) => ({ ...current, slotStart, slotEnd }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.bookingDate || !form.address) {
      setError("Booking date and address are required");
      return;
    }

    if (form.slotStart >= form.slotEnd) {
      setError("End time must be after start time");
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMessage("");
      await api.post("/bookings", { ...form, serviceId: id });
      setSuccessMessage("Booking confirmed. Redirecting to your dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) return <p>Loading booking form...</p>;

  return (
    <div className="booking-layout">
      <section className="booking-story">
        <span className="eyebrow dark">Reservation studio</span>
        <h1>Shape your visit before you pay.</h1>
        <p>
          Pick a practical arrival window, add access instructions, and send the provider a clean
          brief in one place.
        </p>
        <div className="booking-summary-card">
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <div className="summary-list">
            <span>Rs. {service.price}</span>
            <span>{service.provider?.name}</span>
            <span>{service.durationMinutes} mins</span>
            <span>{service.city}</span>
          </div>
        </div>
      </section>

      <section className="auth-card wide booking-card">
        <h2>Confirm your slot</h2>
        <p className="muted-text">
          Mock Razorpay payment is auto-marked paid once the booking is created for this demo flow.
        </p>

        <div className="slot-picker">
          {timeSlots.map((slot) => (
            <button
              key={slot.join("-")}
              type="button"
              className={`slot-tile ${
                form.slotStart === slot[0] && form.slotEnd === slot[1] ? "active" : ""
              }`}
              onClick={() => handleSlotPick(slot)}
            >
              <strong>{slot[0]}</strong>
              <span>to {slot[1]}</span>
            </button>
          ))}
        </div>

        <form className="grid-form" onSubmit={handleSubmit}>
          <label className="field-shell">
            <span>Visit date</span>
            <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} />
          </label>
          <label className="field-shell">
            <span>Start time</span>
            <input name="slotStart" value={form.slotStart} onChange={handleChange} />
          </label>
          <label className="field-shell">
            <span>End time</span>
            <input name="slotEnd" value={form.slotEnd} onChange={handleChange} />
          </label>
          <label className="field-shell">
            <span>Address</span>
            <input name="address" placeholder="Service address" value={form.address} onChange={handleChange} />
          </label>
          <label className="field-shell">
            <span>City</span>
            <input name="city" value={form.city} onChange={handleChange} />
          </label>
          <label className="field-shell">
            <span>Pincode</span>
            <input name="pincode" value={form.pincode} onChange={handleChange} />
          </label>
          <label className="field-shell full-width">
            <span>Access notes</span>
            <textarea
              className="full-width"
              name="notes"
              placeholder="Parking, gate codes, floor details, or cleaning focus areas"
              value={form.notes}
              onChange={handleChange}
            />
          </label>
          {error && <p className="error-text full-width">{error}</p>}
          {successMessage && <p className="success-text full-width">{successMessage}</p>}
          <button className="primary-button full-width" type="submit" disabled={submitting}>
            {submitting ? "Confirming Booking..." : `Pay Rs. ${service.price} and Confirm Booking`}
          </button>
        </form>
      </section>
    </div>
  );
};

export default BookingPage;
