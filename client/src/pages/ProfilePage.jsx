import { useEffect, useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePage = () => {
  const { auth } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    pincode: "",
    address: "",
    bio: "",
    skills: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setForm({
          name: data.data.name || "",
          phone: data.data.phone || "",
          city: data.data.city || "",
          pincode: data.data.pincode || "",
          address: data.data.address || "",
          bio: data.data.bio || "",
          skills: data.data.skills?.join(", ") || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile");
      }
    };

    loadProfile();
  }, []);

  const completionItems = [
    Boolean(form.phone),
    Boolean(form.city),
    Boolean(form.address),
    auth.user?.role !== "provider" || Boolean(form.bio),
    auth.user?.role !== "provider" || Boolean(form.skills),
  ];
  const completion = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.put("/auth/me", {
        ...form,
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      setMessage("Profile updated.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile");
    }
  };

  return (
    <div className="profile-layout">
      <section className="dashboard-card onboarding-card">
        <span className="eyebrow dark">Onboarding</span>
        <h1>Complete your HomeSphere profile</h1>
        <p className="muted-text">
          A stronger profile helps users trust providers and helps customers book faster.
        </p>
        <div className="profile-progress">
          <span style={{ width: `${completion}%` }} />
        </div>
        <strong>{completion}% complete</strong>
        <div className="stack-md">
          <div className="cardish">Add phone and city so bookings are easier to coordinate.</div>
          {auth.user?.role === "provider" && (
            <div className="cardish">Add bio and skills to make your public provider profile stronger.</div>
          )}
          <div className="cardish">Keep address/pincode updated for better local discovery.</div>
        </div>
      </section>

      <section className="auth-card wide">
        <h2>Profile details</h2>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <form className="grid-form" onSubmit={handleSubmit}>
          <label className="field-shell">
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label className="field-shell">
            <span>Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} />
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
            <span>Address</span>
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <label className="field-shell full-width">
            <span>Bio</span>
            <textarea name="bio" value={form.bio} onChange={handleChange} />
          </label>
          <label className="field-shell full-width">
            <span>Skills</span>
            <input
              name="skills"
              placeholder="cleaning, wiring, plumbing"
              value={form.skills}
              onChange={handleChange}
            />
          </label>
          <button className="primary-button full-width" type="submit">
            Save profile
          </button>
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
