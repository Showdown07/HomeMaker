import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    city: "Bengaluru",
    pincode: "560001",
    address: "",
    lat: "12.9716",
    lng: "77.5946",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        location: {
          type: "Point",
          coordinates: [Number(form.lng), Number(form.lat)],
        },
      };
      const { data } = await api.post("/auth/register", payload);
      login(data.data);
      navigate(data.data.role === "provider" ? "/provider" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-sidepanel">
        <span className="eyebrow dark">New member setup</span>
        <h1>Create your service identity with location built in.</h1>
        <p>
          Join as a customer or provider, add your operating city, and unlock real-time bookings
          with geo-aware matching from day one.
        </p>
        <div className="summary-list">
          <span>Role-based access</span>
          <span>Location ready</span>
          <span>Live updates</span>
          <span>Review system</span>
        </div>
      </section>

      <section className="auth-card wide auth-panel">
        <h2>Create account</h2>
        <p className="muted-text">Tell us who you are and where you operate.</p>
        <form className="grid-form" onSubmit={handleSubmit}>
          <label className="field-shell">
            <span>Full name</span>
            <input name="name" placeholder="Full name" onChange={handleChange} value={form.name} />
          </label>
          <label className="field-shell">
            <span>Email</span>
            <input name="email" placeholder="Email" onChange={handleChange} value={form.email} />
          </label>
          <label className="field-shell">
            <span>Password</span>
            <input
              name="password"
              placeholder="Password"
              type="password"
              onChange={handleChange}
              value={form.password}
            />
          </label>
          <label className="field-shell">
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="provider">Service Provider</option>
            </select>
          </label>
          <label className="field-shell">
            <span>City</span>
            <input name="city" placeholder="City" onChange={handleChange} value={form.city} />
          </label>
          <label className="field-shell">
            <span>Pincode</span>
            <input name="pincode" placeholder="Pincode" onChange={handleChange} value={form.pincode} />
          </label>
          <label className="field-shell full-width">
            <span>Address</span>
            <input name="address" placeholder="Address" onChange={handleChange} value={form.address} />
          </label>
          <label className="field-shell">
            <span>Latitude</span>
            <input name="lat" placeholder="Latitude" onChange={handleChange} value={form.lat} />
          </label>
          <label className="field-shell">
            <span>Longitude</span>
            <input name="lng" placeholder="Longitude" onChange={handleChange} value={form.lng} />
          </label>
          {error && <p className="error-text full-width">{error}</p>}
          <button className="primary-button full-width" type="submit" disabled={submitting}>
            {submitting ? "Creating Account..." : "Register"}
          </button>
        </form>
        <p className="muted-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;
