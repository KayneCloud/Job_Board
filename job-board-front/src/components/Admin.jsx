import { useEffect, useState } from "react";

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

function JobsSection() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);

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

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const company = companies.find((c) => String(c.id) === String(form.company_id));
    const job = { ...form, company_name: company ? company.name : "" };

    let url = API_URL + "/advertisements";
    let method = "POST";
    if (editingId) {
      url = url + "/" + editingId;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    }).then(() => {
      setForm(emptyJob);
      setEditingId(null);
      loadJobs();
    });
  }

  function handleEdit(job) {
    setForm(job);
    setEditingId(job.id);
  }

  function handleCancel() {
    setForm(emptyJob);
    setEditingId(null);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this job?")) {
      return;
    }
    fetch(API_URL + "/advertisements/" + id, { method: "DELETE" }).then(() => loadJobs());
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Jobs</h2>

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

        <button type="submit" className="btn-primary">
          {editingId ? "SAVE CHANGES" : "ADD JOB"}
        </button>

        {editingId && (
          <button type="button" className="btn-outline" onClick={handleCancel}>
            CANCEL
          </button>
        )}
      </form>

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
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.company_name}</td>
              <td>{job.location}</td>
              <td>{job.contract_type}</td>
              <td className="admin-actions">
                <button className="btn-outline" onClick={() => handleEdit(job)}>EDIT</button>
                <button className="btn-primary" onClick={() => handleDelete(job.id)}>DELETE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompaniesSection() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyCompany);
  const [editingId, setEditingId] = useState(null);

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

    let url = API_URL + "/companies";
    let method = "POST";
    if (editingId) {
      url = url + "/" + editingId;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setForm(emptyCompany);
      setEditingId(null);
      loadCompanies();
    });
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
  }

  function handleCancel() {
    setForm(emptyCompany);
    setEditingId(null);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this company and all its jobs?")) {
      return;
    }
    fetch(API_URL + "/companies/" + id, { method: "DELETE" }).then(() => loadCompanies());
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Companies</h2>

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

        <button type="submit" className="btn-primary">
          {editingId ? "SAVE CHANGES" : "ADD COMPANY"}
        </button>

        {editingId && (
          <button type="button" className="btn-outline" onClick={handleCancel}>
            CANCEL
          </button>
        )}
      </form>

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
          {companies.map((company) => (
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
    </div>
  );
}

function ApplicationsSection() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  function loadApplications() {
    fetch(API_URL + "/applications")
      .then((res) => res.json())
      .then((data) => setApplications(data));
  }

  useEffect(() => {
    loadApplications();
    fetch(API_URL + "/advertisements")
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, []);

  function getJobTitle(adId) {
    const job = jobs.find((j) => String(j.id) === String(adId));
    return job ? job.title : "Deleted job";
  }

  function handleMarkRead(id) {
    fetch(API_URL + "/applications/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "read" }),
    }).then(() => loadApplications());
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this application?")) {
      return;
    }
    fetch(API_URL + "/applications/" + id, { method: "DELETE" }).then(() => loadApplications());
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Applications</h2>

      {applications.length === 0 && <p className="admin-empty">No applications yet.</p>}

      {applications.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{getJobTitle(application.ad_id)}</td>
                <td>{application.name}</td>
                <td>{application.email}</td>
                <td>{application.message}</td>
                <td>{application.status || "sent"}</td>
                <td className="admin-actions">
                  {application.status !== "read" && (
                    <button className="btn-outline" onClick={() => handleMarkRead(application.id)}>MARK READ</button>
                  )}
                  <button className="btn-primary" onClick={() => handleDelete(application.id)}>DELETE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Admin() {
  return (
    <section className="admin">
      <h1>Admin</h1>
      <JobsSection />
      <CompaniesSection />
      <ApplicationsSection />
    </section>
  );
}

export default Admin;