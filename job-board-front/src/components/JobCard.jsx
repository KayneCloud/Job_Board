import { useState } from "react";
import ApplyForm from "./ApplyForm";
import JobDetails, { remoteLabels } from "./JobDetails";

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function JobCard({ job, user, isFavourite, onToggleFavourite }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <article className={showDetails ? "job-card open" : "job-card"}>
      <div className="job-card-top">
        <span className="company-avatar">{getInitials(job.company_name)}</span>

        <div className="job-card-heading">
          <p className="job-company">{job.company_name}</p>
          <h3 className="job-title">{job.title}</h3>
          <p className="job-meta">
            {job.location} · {remoteLabels[job.remote]} · {job.contract_type}
          </p>
        </div>

        {user && user.role === "user" && (
          <button
            className={isFavourite ? "save-button active" : "save-button"}
            onClick={onToggleFavourite}
            aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavourite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
          </button>
        )}
      </div>

      <p className="job-short">{job.short_description}</p>

      <div className="job-tags">
        <span className="tag tag-salary">{job.salary}</span>
      </div>

      <div className="job-card-actions">
        <button className="btn-outline" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "SHOW LESS" : "LEARN MORE"}
        </button>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          APPLY
        </button>
      </div>

      {showDetails && <JobDetails jobId={job.id} />}

      {showForm && <ApplyForm jobId={job.id} user={user} />}
    </article>
  );
}

export default JobCard;