import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Profile({ user, onUpdate }) {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    fetch(API_URL + "/auth/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.token,
      },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((updatedUser) => {
        onUpdate({ ...updatedUser, token: user.token });
        setMessage("Profile updated!");
      })
      .catch(() => setError("Could not update your profile. This email may already be used."));
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>My profile</h1>

      <label>
        First name
        <input name="first_name" value={form.first_name} onChange={handleChange} required />
      </label>

      <label>
        Last name
        <input name="last_name" value={form.last_name} onChange={handleChange} required />
      </label>

      <label>
        Email
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </label>

      <label>
        Phone
        <input name="phone" value={form.phone} onChange={handleChange} />
      </label>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary">SAVE</button>
    </form>
  );
}

export default Profile;