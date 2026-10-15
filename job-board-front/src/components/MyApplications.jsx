import { Fragment, useEffect, useState } from "react";
import JobDetails from "./JobDetails";

const API_URL = import.meta.env.VITE_API_URL;

function MyApplications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetch(API_URL + "/me/applications", {
      headers: { Authorization: "Bearer " + user.token },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((data) => setApplications(data))
      .catch(() => setError("Could not load your applications."))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id) {
    setOpenId(openId === id ? null : id);
  }

  return (
    <section className="admin">
      <h1>My applications</h1>

      {loading && <p className="admin-empty">Loading...</p>}

      {error && <p className="admin-empty status-error">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <p className="admin-empty">You have not applied to any job yet.</p>
      )}

      {applications.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <Fragment key={application.id}>
                <tr>
                  <td>
                    <button className="link-button" onClick={() => toggle(application.id)}>
                      {application.ad_title}
                    </button>
                  </td>
                  <td>{application.company_name}</td>
                  <td>{application.message}</td>
                  <td>{new Date(application.created_at).toLocaleDateString()}</td>
                </tr>

                {openId === application.id && (
                  <tr className="details-row">
                    <td colSpan="4">
                      <JobDetails jobId={application.ad_id} />
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

export default MyApplications;