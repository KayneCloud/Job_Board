import { useEffect, useState } from "react";
import JobCard from "./components/JobCard";
import Login from "./components/Login";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Filters from "./components/Filters";

function App() {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("jobs");

  useEffect(() => {
    fetch("http://localhost:3000/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, []);

  function handleLogin(loggedUser) {
    setUser(loggedUser);
    setPage(loggedUser.role === "admin" ? "admin" : "jobs");
  }

  function handleLogout() {
    setUser(null);
    setPage("jobs");
  }

  return (
    <div>
      <Header page={page} setPage={setPage} user={user} onLogout={handleLogout} />

      {page === "login" && <Login onLogin={handleLogin} />}

      {page === "admin" && user?.role === "admin" && <h1>Admin</h1>}

      {page === "jobs" && (
        <div>
          <Hero />
          <Filters />

          <div className="jobs-layout">
            <section className="job-list">
              <div className="job-list-header">
                <h2>{jobs.length} JOBS</h2>
                <span>Sort: <strong>Most recent</strong></span>
              </div>

              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </section>

            <aside className="job-detail-placeholder">
              Select a job to see the details
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;