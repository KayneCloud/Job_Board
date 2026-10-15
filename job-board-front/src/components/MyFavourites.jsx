import { Fragment, useState } from "react";
import JobDetails from "./JobDetails";

function MyFavourites({ favouriteJobs, onToggleFavourite }) {
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId(openId === id ? null : id);
  }

  return (
    <section className="admin">
      <h1>My favourites</h1>

      {favouriteJobs.length === 0 && (
        <p className="admin-empty">You have no favourite jobs yet.</p>
      )}

      {favouriteJobs.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Location</th>
              <th>Contract</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {favouriteJobs.map((job) => (
              <Fragment key={job.id}>
                <tr>
                  <td>
                    <button className="link-button" onClick={() => toggle(job.id)}>
                      {job.title}
                    </button>
                  </td>
                  <td>{job.company_name}</td>
                  <td>{job.location}</td>
                  <td>{job.contract_type}</td>
                  <td className="admin-actions">
                    <button className="btn-outline" onClick={() => onToggleFavourite(job.id)}>
                      REMOVE
                    </button>
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
      )}
    </section>
  );
}

export default MyFavourites;