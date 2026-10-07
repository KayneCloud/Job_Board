import { useState } from "react";

function ApplyForm({ jobId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    fetch("http://localhost:3000/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad_id: jobId,
        name: name,
        email: email,
        phone: phone,
        message: message,
      }),
    }).then((res) => {
      if (res.ok) setSent(true);
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