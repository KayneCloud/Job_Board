import { useEffect, useState } from "react";
import Profile from "./Profile";

const API_URL = import.meta.env.VITE_API_URL;

const emptyCompany = {
  name: "",
  sector: "",
  city: "",
  website: "",
  description: "",
};

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

function EmployerInfo({ user, onUpdate }) {
  const [company, setCompany] = useState(emptyCompany);
  const [allCompanies, setAllCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.company_id) {
      fetch(API_URL + "/companies/" + user.company_id)
        .then((res) => res.json())
        .then((data) =>
          setCompany({
            name: data.name || "",
            sector: data.sector || "",
            city: data.city || "",
            website: data.website || "",
            description: data.description || "",
          })
        );
    } else {
      fetch(API_URL + "/companies")
        .then((res) => res.json())
        .then((data) => setAllCompanies(data));
    }
  }, [user.company_id]);

  const results = allCompanies
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  function handleChange(event) {
    setCompany({ ...company, [event.target.name]: event.target.value });
  }

  function handleJoin(companyId) {
    setError("");

    fetch(API_URL + "/me/company", {
      method: "PATCH",
      headers: authHeaders(user.token),
      body: JSON.stringify({ company_id: companyId }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((data) => {
        onUpdate({ ...user, company_id: data.id });
        setMessage("You joined " + data.name + "!");
      })
      .catch(() => setError("Could not join this company."));
  }

  function handleOpenCreate() {
    setCompany({ ...emptyCompany, name: search });
    setShowCreate(true);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const hasCompany = Boolean(user.company_id);

    fetch(API_URL + "/me/company", {
      method: hasCompany ? "PUT" : "POST",
      headers: authHeaders(user.token),
      body: JSON.stringify(company),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((data) => {
        if (!hasCompany) {
          onUpdate({ ...user, company_id: data.id });
        }
        setMessage(hasCompany ? "Company updated!" : "Company created!");
      })
      .catch(() => setError("Could not save your company."));
  }

  const companyForm = (
    <form className="form-card" onSubmit={handleSubmit}>
      <h1>{user.company_id ? "My company" : "Create my company"}</h1>

      <label>
        Name
        <input name="name" value={company.name} onChange={handleChange} required />
      </label>

      <label>
        Sector
        <input name="sector" value={company.sector} onChange={handleChange} />
      </label>

      <label>
        City
        <input name="city" value={company.city} onChange={handleChange} />
      </label>

      <label>
        Website
        <input name="website" value={company.website} onChange={handleChange} />
      </label>

      <label>
        Description
        <textarea name="description" value={company.description} onChange={handleChange} />
      </label>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary">
        {user.company_id ? "SAVE" : "CREATE MY COMPANY"}
      </button>

      {!user.company_id && (
        <p className="form-switch">
          <button type="button" className="link-button" onClick={() => setShowCreate(false)}>
            Back to search
          </button>
        </p>
      )}
    </form>
  );

  const searchCard = (
    <div className="form-card">
      <h1>Find my company</h1>

      <label>
        Company name
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type to search..." />
      </label>

      {search && results.length > 0 && (
        <ul className="company-results">
          {results.map((c) => (
            <li key={c.id} className="company-result">
              <span>
                <strong>{c.name}</strong>
                {c.city && " · " + c.city}
              </span>
              <button className="btn-outline" onClick={() => handleJoin(c.id)}>
                JOIN
              </button>
            </li>
          ))}
        </ul>
      )}

      {search && results.length === 0 && <p className="form-switch">No company found.</p>}

      {error && <p className="form-error">{error}</p>}

      <p className="form-switch">
        Can't find it?{" "}
        <button type="button" className="link-button" onClick={handleOpenCreate}>
          Create it
        </button>
      </p>
    </div>
  );

  return (
    <section className="admin">
      <h1>My information</h1>

      <div className="employer-forms">
        <Profile user={user} onUpdate={onUpdate} title="Personal information" />

        {user.company_id || showCreate ? companyForm : searchCard}
      </div>
    </section>
  );
}

export default EmployerInfo;