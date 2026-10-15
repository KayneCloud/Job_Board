import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export const remoteLabels = {
  no: "On site",
  partial: "Hybrid",
  full: "Remote",
};

function JobDetails({ jobId }) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL + "/advertisements/" + jobId)
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((data) => setJob(data))
      .catch(() => setError("This job is no longer available."));
  }, [jobId]);

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!job) {
    return <p className="job-full">Loading...</p>;
  }

  return (
    <div className="job-details">
      <p className="job-full">{job.full_description}</p>

      <dl className="info-grid">
        <div className="info-tile">
          <dt>CONTRACT</dt>
          <dd>{job.contract_type}</dd>
        </div>
        <div className="info-tile">
          <dt>SALARY</dt>
          <dd>{job.salary}</dd>
        </div>
        <div className="info-tile">
          <dt>WORKING TIME</dt>
          <dd>{job.working_time}</dd>
        </div>
        <div className="info-tile">
          <dt>REMOTE</dt>
          <dd>{remoteLabels[job.remote]}</dd>
        </div>
      </dl>
    </div>
  );
}

export default JobDetails;