import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ApplyForm({ jobId, user }) {
  const [name, setName] = useState(user ? user.first_name + " " + user.last_name : "");
  const [email, setEmail] = useState(user ? user.email : "");
  const [phone, setPhone] = useState(user ? user.phone : "");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    fetch(API_URL + "/advertisements/" + jobId + "/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person_id: user ? user.id : null,
        name: name,
        email: email,
        phone: phone,
        message: message,
      }),
    }).then((res) => {
      if (res.ok) {
        setSent(true);
      } else {
        setError("Could not send your application");
      }
    });
  }

  if (sent) {
    return <p className="form-success">Your application has been sent!</p>;
  }

  return (
    <form className="apply-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label>
        Phone
        <input value={phone || ""} onChange={(e) => setPhone(e.target.value)} />
      </label>

      <label>
        Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary">SEND</button>
    </form>
  );
}

export default ApplyForm;