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

function Admin() {
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

    const company = companies.find((c) => c.id === form.company_id);
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
    <section className="admin">
      <h1>Admin</h1>

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
    </section>
  );
}

export default Admin;