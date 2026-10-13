import { useEffect, useState } from "react";
import JobCard from "./components/JobCard";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Filters from "./components/Filters";
import Footer from "./components/Footer";
import Admin from "./components/Admin";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("jobs");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All");

  useEffect(() => {
    fetch(API_URL + "/advertisements")
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, [page]);

  const types = ["All", ...new Set(jobs.map((job) => job.contract_type))];

  const filteredJobs = jobs.filter((job) => {
    const where = job.location + " " + (job.remote === "full" ? "remote" : "");
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchLocation = where.toLowerCase().includes(location.toLowerCase());
    const matchType = type === "All" || job.contract_type === type;
    return matchSearch && matchLocation && matchType;
  });

  function clearFilters() {
    setSearch("");
    setLocation("");
    setType("All");
  }

  function handleLogin(loggedUser) {
    setUser(loggedUser);
    if (loggedUser.role === "admin") {
      setPage("admin");
    } else {
      setPage("jobs");
    }
  }

  function handleLogout() {
    setUser(null);
    setPage("jobs");
  }

  return (
    <div>
      <Header page={page} setPage={setPage} user={user} onLogout={handleLogout} />

      {page === "login" && <Login onLogin={handleLogin} />}

      {page === "register" && <Register onRegister={handleLogin} />}

      {page === "admin" && user && user.role === "admin" && <Admin token={user.token} />}
      
      {page === "jobs" && (
        <div>
          <Hero search={search} setSearch={setSearch} location={location} setLocation={setLocation} />
          <Filters types={types} type={type} setType={setType} onClear={clearFilters} />

          <section className="job-list" id="job-list">
            <h2>{filteredJobs.length} JOBS</h2>
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} user={user} />
            ))}
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;