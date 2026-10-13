import { useState } from "react";
import { login } from "../auth";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    login(email, password)
      .then((user) => onLogin(user))
      .catch(() => setError("Wrong email or password"));
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>Sign in</h1>

      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary">SIGN IN</button>
    </form>
  );
}

export default Login;