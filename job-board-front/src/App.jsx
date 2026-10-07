import { useEffect, useState } from "react";
import JobCard from "./components/JobCard";
import Login from "./components/Login";

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
      <nav>
        <button onClick={() => setPage("jobs")}>Jobs</button>
        {user ? (
          <button onClick={handleLogout}>Log out</button>
        ) : (
          <button onClick={() => setPage("login")}>Sign in</button>
        )}
      </nav>

      {page === "login" && <Login onLogin={handleLogin} />}

      {page === "admin" && user?.role === "admin" && <h1>Admin</h1>}

      {page === "jobs" && (
        <div>
          <h1>Job Board</h1>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;