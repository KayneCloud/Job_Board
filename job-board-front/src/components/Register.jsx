import { useEffect, useState } from "react";
import { login } from "../auth";

const API_URL = import.meta.env.VITE_API_URL;

function Register({ onRegister, onGoToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", sector: "", city: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL + "/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  const results =
    search.length >= 2
      ? companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
      : [];

  function handleSelect(company) {
    setSelectedCompany(company);
    setSearch("");
  }

  function handleStartCreate() {
    setNewCompany({ name: search, sector: "", city: "" });
    setCreating(true);
  }

  function handleBackToSearch() {
    setCreating(false);
    setSelectedCompany(null);
  }

  function handleNewCompanyChange(event) {
    setNewCompany({ ...newCompany, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const body = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      password: password,
      role: role,
    };

    if (role === "employer") {
      if (creating) {
        body.new_company = newCompany;
      } else if (selectedCompany) {
        body.company_id = selectedCompany.id;
      } else {
        setError("Please find your company, or create it.");
        return;
      }
    }

    fetch(API_URL + "/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data: data })))
      .then((result) => {
        if (!result.ok) {
          setError(result.data.error || "Could not create account.");
          return;
        }
        return login(email, password)
          .then((user) => onRegister(user))
          .catch(() => setError("Account created, but automatic sign in failed. Please sign in."));
      })
      .catch(() => setError("Server not available. Please try again later."));
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>Create an account</h1>

      <label>
        I am
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">Looking for a job</option>
          <option value="employer">Hiring (employer)</option>
        </select>
      </label>

      {role === "employer" && !creating && !selectedCompany && (
        <>
          <label>
            My company
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type your company name..."
            />
          </label>

          {results.length > 0 && (
            <ul className="company-results">
              {results.map((c) => (
                <li key={c.id}>
                  <button type="button" className="company-result" onClick={() => handleSelect(c)}>
                    <strong>{c.name}</strong>
                    {c.city && <span>{c.city}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {search.length >= 2 && results.length === 0 && (
            <p className="form-switch">
              No company found.{" "}
              <button type="button" className="link-button" onClick={handleStartCreate}>
                Create "{search}"
              </button>
            </p>
          )}
        </>
      )}

      {role === "employer" && selectedCompany && (
        <p className="company-selected">
          <span>
            Company: <strong>{selectedCompany.name}</strong>
          </span>
          <button type="button" className="link-button" onClick={handleBackToSearch}>
            Change
          </button>
        </p>
      )}

      {role === "employer" && creating && (
        <>
          <label>
            Company name
            <input name="name" value={newCompany.name} onChange={handleNewCompanyChange} required />
          </label>

          <label>
            Sector
            <input name="sector" value={newCompany.sector} onChange={handleNewCompanyChange} />
          </label>

          <label>
            City
            <input name="city" value={newCompany.city} onChange={handleNewCompanyChange} />
          </label>

          <p className="form-switch">
            <button type="button" className="link-button" onClick={handleBackToSearch}>
              Back to search
            </button>
          </p>
        </>
      )}

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