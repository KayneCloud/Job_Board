import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ApplyForm({ jobId, user }) {
  const [name, setName] = useState(user ? user.first_name + " " + user.last_name : "");
  const [email, setEmail] = useState(user ? user.email : "");
  const [phone, setPhone] = useState(user ? user.phone : "");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    fetch(API_URL + "/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: jobId,
        user_id: user ? user.id : null,
        name: name,
        email: email,
        phone: phone,
        message: message,
        date: new Date().toISOString(),
      }),
    }).then((res) => {
      if (res.ok) {
        setSent(true);
      }
    });
  }

  if (sent) {
    return <p>Your application has been sent!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
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
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>

      <label>
        Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
      </label>

      <button type="submit">Send</button>
    </form>
  );
}

export default ApplyForm;