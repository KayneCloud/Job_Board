import { Fragment, useEffect, useState } from "react";
import JobDetails from "./JobDetails";
import Details from "./Details";

const API_URL = import.meta.env.VITE_API_URL;

const emptyJob = {
  title: "",
  short_description: "",
  full_description: "",
  location: "",
  contract_type: "",
  working_time: "",
  salary: "",
  remote: "no",
};

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

function Employer({ user }) {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  const [openDetailsId, setOpenDetailsId] = useState(null);
  const [openJobId, setOpenJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  function loadJobs() {
    fetch(API_URL + "/advertisements")
      .then((res) => res.json())
      .then((data) => setJobs(data.filter((job) => String(job.company_id) === String(user.company_id))));
  }

  useEffect(() => {
    fetch(API_URL + "/companies/" + user.company_id)
      .then((res) => res.json())
      .then((data) => setCompany(data));
    loadJobs();
  }, []);

  function toggleDetails(id) {
    setOpenDetailsId(openDetailsId === id ? null : id);
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm(emptyJob);
    setEditingId(null);
    setError("");
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
      headers: authHeaders(user.token),
      body: JSON.stringify({ ...form, company_id: user.company_id }),
    })
      .then((res) => {
        if (!res.ok) {
          setError("Could not save this job. Please check the fields.");
          return;
        }
        resetForm();
        loadJobs();
      })
      .catch(() => setError("Server not available."));
  }

  function handleEdit(job) {
    setForm({
      title: job.title,
      short_description: job.short_description,
      full_description: job.full_description || "",
      location: job.location || "",
      contract_type: job.contract_type || "",
      working_time: job.working_time || "",
      salary: job.salary || "",
      remote: job.remote,
    });
    setEditingId(job.id);
    setError("");
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this job and its applications?")) {
      return;
    }
    fetch(API_URL + "/advertisements/" + id, {
      method: "DELETE",
      headers: authHeaders(user.token),
    })
      .then((res) => {
        if (!res.ok) {
          setError("Could not delete this job.");
          return;
        }
        if (openJobId === id) {
          setOpenJobId(null);
        }
        loadJobs();
      })
      .catch(() => setError("Server not available."));
  }

  function handleShowApplications(jobId) {
    if (openJobId === jobId) {
      setOpenJobId(null);
      return;
    }
    fetch(API_URL + "/advertisements/" + jobId + "/applications", {
      headers: authHeaders(user.token),
    })
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setOpenJobId(jobId);
      });
  }

  const openJob = jobs.find((job) => job.id === openJobId);

  return (
    <section className="admin">
      <h1>{company ? company.name : "My jobs"}</h1>

      <div className="admin-section">
        <h2 className="admin-section-title">My jobs</h2>

        <div className="admin-layout">
          <form className="form-card admin-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit job" : "Post a job"}</h2>

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
              {editingId ? "SAVE CHANGES" : "POST JOB"}
            </button>

            {editingId && (
              <button type="button" className="btn-outline" onClick={resetForm}>
                CANCEL
              </button>
            )}
          </form>

          <div className="admin-list">
            {jobs.length === 0 && <p className="admin-empty">You have not posted any job yet.</p>}

            {jobs.length > 0 && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Contract</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <Fragment key={job.id}>
                      <tr>
                        <td>
                          <span className="title-with-toggle">
                            <Details open={openDetailsId === job.id} onClick={() => toggleDetails(job.id)} />
                            {job.title}
                          </span>
                        </td>
                        <td>{job.location}</td>
                        <td>{job.contract_type}</td>
                        <td className="admin-actions">
                          <button className="btn-outline" onClick={() => handleShowApplications(job.id)}>
                            {openJobId === job.id ? "HIDE" : "APPLICATIONS"}
                          </button>
                          <button className="btn-outline" onClick={() => handleEdit(job)}>EDIT</button>
                          <button className="btn-primary" onClick={() => handleDelete(job.id)}>DELETE</button>
                        </td>
                      </tr>

                      {openDetailsId === job.id && (
                        <tr className="details-row">
                          <td colSpan="4">
                            <JobDetails jobId={job.id} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {openJob && (
        <div className="admin-section">
          <h2 className="admin-section-title">Applications for {openJob.title}</h2>

          {applications.length === 0 && <p className="admin-empty">No applications for this job yet.</p>}

          {applications.length > 0 && (
            <div className="admin-list admin-list-full">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.name}</td>
                      <td>{application.email}</td>
                      <td>{application.phone}</td>
                      <td>{application.message}</td>
                      <td>{new Date(application.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Employer;