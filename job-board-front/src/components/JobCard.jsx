import { useState } from "react";
import ApplyForm from "./ApplyForm";

function JobCard({ job }) {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function handleLearnMore() {
    setIsOpen(!isOpen);

    fetch(`http://localhost:3000/jobs/${job.id}`)
      .then((res) => res.json())
      .then((data) => setDetails(data));
  }

  return (
    <div>
      <h2>{job.title}</h2>
      <p>{job.company_name} · {job.location}</p>
      <p>{job.short_description}</p>

      <button onClick={handleLearnMore}>
        {isOpen ? "Show less" : "Learn more"}
      </button>
      <button onClick={() => setShowForm(!showForm)}>Apply</button>

      {isOpen && details && (
        <div>
          <p>{details.full_description}</p>
          <p><strong>Contract:</strong> {details.contract_type}</p>
          <p><strong>Salary:</strong> {details.salary}</p>
          <p><strong>Working time:</strong> {details.working_time}</p>
          <p><strong>Remote:</strong> {details.remote}</p>
        </div>
      )}

      {showForm && <ApplyForm jobId={job.id} />}
    </div>
  );
}

export default JobCard;