import { Fragment, useEffect, useState } from "react";
import JobDetails from "./JobDetails";
import Details from "./Details";

const API_URL = import.meta.env.VITE_API_URL;

const emptyJob = {
  title: "",
  short_description: "",
  full_description: "",
  company_id: "",
  location: "",
  contract_type: "",
  working_time: "",
  salary: "",
  remote: "no",
};

const emptyCompany = {
  name: "",
  sector: "",
  city: "",
  website: "",
  description: "",
};

const emptyPerson = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  company_id: "",
};

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

const PAGE_SIZE = 9;

function Pagination({ page, total, onChange }) {
  const pageCount = Math.ceil(total / PAGE_SIZE);

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button className="btn-outline" disabled={page === 1} onClick={() => onChange(page - 1)}>
        PREVIOUS
      </button>
      <span>Page {page} / {pageCount}</span>
      <button className="btn-outline" disabled={page === pageCount} onClick={() => onChange(page + 1)}>
        NEXT
      </button>
    </div>
  );
}

function JobsSection({ token }) {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState("");

  function loadJobs() {
    fetch(API_URL + "/advertisements")
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }

  useEffect(() => {
    loadJobs();
    fetch(API_URL + "/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  function toggle(id) {
    setOpenId(openId === id ? null : id);
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    let url = API_URL + "/advertisements";
    let method = "POST";
    if (editingId) {
      url = url + "/" + editingId;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: authHeaders(token),
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) {
          setError("Could not save this job. Please check the fields.");
          return;
        }
        setForm(emptyJob);
        setEditingId(null);
        loadJobs();
      })
      .catch(() => setError("Server not available."));
  }

  function handleEdit(job) {
    setForm({
      title: job.title,
      short_description: job.short_description,
      full_description: job.full_description || "",
      company_id: job.company_id,
      location: job.location || "",
      contract_type: job.contract_type || "",
      working_time: job.working_time || "",
      salary: job.salary || "",
      remote: job.remote,
    });
    setEditingId(job.id);
    setError("");
  }

  function handleCancel() {
    setForm(emptyJob);
    setEditingId(null);
    setError("");
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this job?")) {
      return;
    }
    fetch(API_URL + "/advertisements/" + id, {
      method: "DELETE",
      headers: authHeaders(token),
    })
      .then((res) => {
        if (!res.ok) {
          setError("Could not delete this job.");
          return;
        }
        loadJobs();
      })
      .catch(() => setError("Server not available."));
  }

  const visibleJobs = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Jobs</h2>

      <div className="admin-layout">
        <form className="form-card admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit job" : "Add a job"}</h2>

          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Short description
            <input name="short_description" value={form.short_description} onChange={handleChange} required />
          </label>

          <label>
            Full description
            <textarea name="full_description" value={form.full_description} onChange={handleChange} />
          </label>

          <label>
            Company
            <select name="company_id" value={form.company_id} onChange={handleChange} required>
              <option value="">Choose a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} />
          </label>

          <label>
            Contract type
            <input name="contract_type" value={form.contract_type} onChange={handleChange} placeholder="Full-time, Internship..." />
          </label>

          <label>
            Working time
            <input name="working_time" value={form.working_time} onChange={handleChange} />
          </label>

          <label>
            Salary
            <input name="salary" value={form.salary} onChange={handleChange} />
          </label>

          <label>
            Remote
            <select name="remote" value={form.remote} onChange={handleChange}>
              <option value="no">On site</option>
              <option value="partial">Hybrid</option>
              <option value="full">Remote</option>
            </select>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary">
            {editingId ? "SAVE CHANGES" : "ADD JOB"}
          </button>

          {editingId && (
            <button type="button" className="btn-outline" onClick={handleCancel}>
              CANCEL
            </button>
          )}
        </form>

        <div className="admin-list">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Contract</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleJobs.map((job) => (
                <Fragment key={job.id}>
                  <tr>
                    <td>
                      <span className="title-with-toggle">
                        <Details open={openId === job.id} onClick={() => toggle(job.id)} />
                        {job.title}
                      </span>
                    </td>
                    <td>{job.company_name}</td>
                    <td>{job.location}</td>
                    <td>{job.contract_type}</td>
                    <td className="admin-actions">
                      <button className="btn-outline" onClick={() => handleEdit(job)}>EDIT</button>
                      <button className="btn-primary" onClick={() => handleDelete(job.id)}>DELETE</button>
                    </td>
                  </tr>

                  {openId === job.id && (
                    <tr className="details-row">
                      <td colSpan="5">
                        <JobDetails jobId={job.id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={jobs.length} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}

function CompaniesSection({ token }) {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyCompany);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  function loadCompanies() {
    fetch(API_URL + "/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    let url = API_URL + "/companies";
    let method = "POST";
    if (editingId) {
      url = url + "/" + editingId;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: authHeaders(token),
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) {
          setError("Could not save this company. Please check the fields.");
          return;
        }
        setForm(emptyCompany);
        setEditingId(null);
        loadCompanies();
      })
      .catch(() => setError("Server not available."));
  }

  function handleEdit(company) {
    setForm({
      name: company.name || "",
      sector: company.sector || "",
      city: company.city || "",
      website: company.website || "",
      description: company.description || "",
    });
    setEditingId(company.id);
    setError("");
  }

  function handleCancel() {
    setForm(emptyCompany);
    setEditingId(null);
    setError("");
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this company and all its jobs?")) {
      return;
    }
    fetch(API_URL + "/companies/" + id, {
      method: "DELETE",
      headers: authHeaders(token),
    })
      .then((res) => {
        if (!res.ok) {
          setError("Could not delete this company.");
          return;
        }
        loadCompanies();
      })
      .catch(() => setError("Server not available."));
  }

  const visibleCompanies = companies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Companies</h2>

      <div className="admin-layout">
        <form className="form-card admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit company" : "Add a company"}</h2>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Sector
            <input name="sector" value={form.sector} onChange={handleChange} />
          </label>

          <label>
            City
            <input name="city" value={form.city} onChange={handleChange} />
          </label>

          <label>
            Website
            <input name="website" value={form.website} onChange={handleChange} />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary">
            {editingId ? "SAVE CHANGES" : "ADD COMPANY"}
          </button>

          {editingId && (
            <button type="button" className="btn-outline" onClick={handleCancel}>
              CANCEL
            </button>
          )}
        </form>

        <div className="admin-list">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sector</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCompanies.map((company) => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{company.sector}</td>
                  <td>{company.city}</td>
                  <td className="admin-actions">
                    <button className="btn-outline" onClick={() => handleEdit(company)}>EDIT</button>
                    <button className="btn-primary" onClick={() => handleDelete(company.id)}>DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={companies.length} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}

function ApplicationsSection({ token }) {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  function loadApplications() {
    fetch(API_URL + "/applications", { headers: authHeaders(token) })
      .then((res) => res.json())
      .then((data) => setApplications(data));
  }

  useEffect(() => {
    loadApplications();
  }, []);

  function toggle(id) {
    setOpenId(openId === id ? null : id);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this application?")) {
      return;
    }
    fetch(API_URL + "/applications/" + id, {
      method: "DELETE",
      headers: authHeaders(token),
    }).then(() => loadApplications());
  }

  const visibleApplications = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Applications</h2>

      {applications.length === 0 && <p className="admin-empty">No applications yet.</p>}

      {applications.length > 0 && (
        <div className="admin-list admin-list-full">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleApplications.map((application) => (
                <Fragment key={application.id}>
                  <tr>
                    <td>
                      <span className="title-with-toggle">
                        <Details open={openId === application.id} onClick={() => toggle(application.id)} />
                        {application.ad_title}
                      </span>
                    </td>
                    <td>{application.name}</td>
                    <td>{application.email}</td>
                    <td>{application.message}</td>
                    <td>{new Date(application.created_at).toLocaleDateString()}</td>
                    <td className="admin-actions">
                      <button className="btn-primary" onClick={() => handleDelete(application.id)}>DELETE</button>
                    </td>
                  </tr>

                  {openId === application.id && (
                    <tr className="details-row">
                      <td colSpan="6">
                        <JobDetails jobId={application.ad_id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={applications.length} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

function PeopleSection({ token }) {
  const [people, setPeople] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyPerson);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  function loadPeople() {
    fetch(API_URL + "/people", { headers: authHeaders(token) })
      .then((res) => res.json())
      .then((data) => setPeople(data));
  }

  useEffect(() => {
    loadPeople();
    fetch(API_URL + "/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm(emptyPerson);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const person = { ...form, company_id: form.company_id || null };

    let url = API_URL + "/auth/signup";
    let method = "POST";
    if (editingId) {
      url = API_URL + "/people/" + editingId;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: authHeaders(token),
      body: JSON.stringify(person),
    })
      .then((res) => {
        if (!res.ok) {
          setError("Could not save. This email may already be used.");
          return;
        }
        resetForm();
        loadPeople();
      })
      .catch(() => setError("Server not available."));
  }

  function handleEdit(person) {
    setForm({
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone || "",
      password: "",
      role: person.role,
      company_id: person.company_id || "",
    });
    setEditingId(person.id);
    setError("");
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this person and all their applications?")) {
      return;
    }
    fetch(API_URL + "/people/" + id, {
      method: "DELETE",
      headers: authHeaders(token),
    }).then(() => loadPeople());
  }

  const visiblePeople = people.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">People</h2>

      <div className="admin-layout">
        <form className="form-card admin-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit person" : "Add a person"}</h2>

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

          {!editingId && (
            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>
          )}

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="employer">Employer</option>
              {editingId && <option value="admin">Admin</option>}
            </select>
          </label>

          <label>
            Company
            <select name="company_id" value={form.company_id} onChange={handleChange}>
              <option value="">None</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary">
            {editingId ? "SAVE CHANGES" : "ADD PERSON"}
          </button>

          {editingId && (
            <button type="button" className="btn-outline" onClick={resetForm}>
              CANCEL
            </button>
          )}
        </form>

        <div className="admin-list">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePeople.map((person) => (
                <tr key={person.id}>
                  <td>{person.first_name} {person.last_name}</td>
                  <td>{person.email}</td>
                  <td>{person.role}</td>
                  <td>{person.company_name}</td>
                  <td className="admin-actions">
                    <button className="btn-outline" onClick={() => handleEdit(person)}>EDIT</button>
                    <button className="btn-primary" onClick={() => handleDelete(person.id)}>DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} total={people.length} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}

function Admin({ token }) {
  return (
    <section className="admin">
      <h1>Admin</h1>
      <JobsSection token={token} />
      <CompaniesSection token={token} />
      <ApplicationsSection token={token} />
      <PeopleSection token={token} />
    </section>
  );
}

export default Admin;