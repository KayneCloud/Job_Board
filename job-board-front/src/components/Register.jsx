import { useState } from "react";
import { login } from "../Auth";

const API_URL = import.meta.env.VITE_API_URL;

function Register({ onRegister, onGoToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    fetch(API_URL + "/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        password: password,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return login(email, password);
      })
      .then((user) => onRegister(user))
      .catch(() => setError("Could not create account. This email may already be used."));
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>Create an account</h1>

      <label>
        First name
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </label>

      <label>
        Last name
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
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
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary">CREATE ACCOUNT</button>

      <p className="form-switch">
        Already have an account?{" "}
        <button type="button" className="link-button" onClick={onGoToLogin}>
          Sign in
        </button>
      </p>
    </form>
  );
}

export default Register;