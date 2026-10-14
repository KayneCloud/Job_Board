import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const statusLabels = {
  sent: "Sent",
  read: "Seen by the recruiter",
};

function Profile({ user, onUpdate }) {
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetch(API_URL + "/people/" + user.id + "/applications", {
      headers: { Authorization: "Bearer " + user.token },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((data) => setApplications(data))
      .catch(() => setApplications([]));
  }, []);

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
    <section className="admin">
      <h1>My profile</h1>

      <form className="form-card profile-form" onSubmit={handleSubmit}>
        <h2>My information</h2>

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

      <div className="profile-section">
        <h2 className="admin-section-title">My applications</h2>

        {applications.length === 0 && <p className="admin-empty">You have not applied to any job yet.</p>}

        {applications.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.ad_title}</td>
                  <td>{application.company_name}</td>
                  <td>{application.message}</td>
                  <td>{new Date(application.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={"status-badge status-" + application.status}>
                      {statusLabels[application.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default Profile;