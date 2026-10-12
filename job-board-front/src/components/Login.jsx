import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    fetch(API_URL + "/users?email=" + encodeURIComponent(email))
      .then((res) => res.json())
      .then((users) => {
        const user = users[0];
        if (user && user.password === password) {
          onLogin(user);
        } else {
          setError("Wrong email or password");
        }
      })
      .catch(() => setError("Server not available"));
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