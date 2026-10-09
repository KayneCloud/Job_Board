import { useState } from "react";
import ApplyForm from "./ApplyForm";

const remoteLabels = {
  no: "On site",
  partial: "Hybrid",
  yes: "Remote",
};

function getInitials(name) {
  return name
    .split(" ")
    .filter((word) => /[A-Za-z]/.test(word[0]))
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function JobCard({ job }) {
  const [details, setDetails] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function handleLearnMore() {
    if (details) {
      setDetails(null);
      return;
    }

    fetch(`http://localhost:3000/jobs/${job.id}`)
      .then((res) => res.json())
      .then((data) => setDetails(data));
  }

  return (
    <article className={details ? "job-card open" : "job-card"}>
      <div className="job-card-top">
        <span className="company-avatar">{getInitials(job.company_name)}</span>

        <div className="job-card-heading">
          <p className="job-company">{job.company_name}</p>
          <h3 className="job-title">{job.title}</h3>
          <p className="job-meta">
            {job.location} · {remoteLabels[job.remote]} · {job.contract_type}
          </p>
        </div>

        <button className="save-button" aria-label="Save this job">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3h12v18l-6-4-6 4z" />
          </svg>
        </button>
      </div>

      <p className="job-short">{job.short_description}</p>

      <div className="job-tags">
        <span className="tag tag-salary">{job.salary}</span>
      </div>

      <div className="job-card-actions">
        <button className="btn-outline" onClick={handleLearnMore}>
          {details ? "SHOW LESS" : "LEARN MORE"}
        </button>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          APPLY
        </button>
      </div>

      {details && (
        <div className="job-details">
          <p className="job-full">{details.full_description}</p>

          <dl className="info-grid">
            <div className="info-tile">
              <dt>CONTRACT</dt>
              <dd>{details.contract_type}</dd>
            </div>
            <div className="info-tile">
              <dt>SALARY</dt>
              <dd>{details.salary}</dd>
            </div>
            <div className="info-tile">
              <dt>WORKING TIME</dt>
              <dd>{details.working_time}</dd>
            </div>
            <div className="info-tile">
              <dt>REMOTE</dt>
              <dd>{remoteLabels[details.remote]}</dd>
            </div>
          </dl>
        </div>
      )}

      {showForm && <ApplyForm jobId={job.id} />}
    </article>
  );
}

export default JobCard;