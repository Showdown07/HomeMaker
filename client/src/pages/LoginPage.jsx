import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post("/auth/login", form);
      login(data.data);
      navigate(data.data.role === "provider" ? "/provider" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-sidepanel">
        <span className="eyebrow dark">Welcome back</span>
        <h1>Step into your home operations cockpit.</h1>
        <p>
          Track bookings, respond to live activity, and move from browsing to confirmed visits
          without friction.
        </p>
        <div className="hero-metrics compact">
          <div className="metric-tile">
            <strong>Live</strong>
            <span>Notifications</span>
          </div>
          <div className="metric-tile">
            <strong>Geo-aware</strong>
            <span>Discovery</span>
          </div>
          <div className="metric-tile">
            <strong>Fast</strong>
            <span>Booking flow</span>
          </div>
        </div>
      </section>

      <section className="auth-card auth-panel">
        <h2>Login</h2>
        <p className="muted-text">Use your existing customer or provider account to continue.</p>
        <form className="stack-md" onSubmit={handleSubmit}>
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
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <p className="muted-text">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
