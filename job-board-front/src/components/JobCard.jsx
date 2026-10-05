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
      <p>{job.company} · {job.location}</p>
      <p>{job.shortDescription}</p>

      <button onClick={handleLearnMore}>
        {isOpen ? "Show less" : "Learn more"}
      </button>
      <button onClick={() => setShowForm(!showForm)}>Apply</button>

      {isOpen && details && (
        <div>
          <p>{details.description}</p>
          <p><strong>Contract:</strong> {details.contract}</p>
          <p><strong>Salary:</strong> {details.salary}</p>
          <p><strong>Working time:</strong> {details.workingTime}</p>
        </div>
      )}

      {showForm && <ApplyForm jobId={job.id} />}
    </div>
  );
}

export default JobCard;