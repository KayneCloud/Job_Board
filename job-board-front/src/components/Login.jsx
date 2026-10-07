import { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((user) => onLogin(user))
      .catch(() => setError("Wrong email or password"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign in</h1>

      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>

      {error && <p>{error}</p>}

      <button type="submit">Sign in</button>
    </form>
  );
}

export default Login;