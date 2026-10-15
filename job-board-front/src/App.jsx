import { useEffect, useState } from "react";
import JobCard from "./components/JobCard";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Filters from "./components/Filters";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import Employer from "./components/Employer";
import EmployerInfo from "./components/EmployerInfo";
import Profile from "./components/Profile";
import MyApplications from "./components/MyApplications";
import MyFavourites from "./components/MyFavourites";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(localStorage.getItem("page") || "jobs");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("All");
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);

  useEffect(() => {
    localStorage.setItem("page", page);
  }, [page]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (page !== "login" && page !== "register") {
        setPage("jobs");
      }
      return;
    }

    fetch(API_URL + "/auth/me", {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((data) => setUser({ ...data, token: token }))
      .catch(() => {
        localStorage.removeItem("token");
        setPage("jobs");
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(API_URL + "/advertisements")
      .then((res) => {
        if (!res.ok) {
          throw new Error();
        }
        return res.json();
      })
      .then((data) => setJobs(data))
      .catch(() => setError("Could not load jobs. Please try again later."))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    if (!user || user.role !== "user") {
      setFavouriteIds([]);
      setAppliedIds([]);
      return;
    }

    const headers = { Authorization: "Bearer " + user.token };

    fetch(API_URL + "/me/favourites", { headers: headers })
      .then((res) => res.json())
      .then((data) => setFavouriteIds(data.map((job) => job.id)));

    fetch(API_URL + "/me/applications", { headers: headers })
      .then((res) => res.json())
      .then((data) => setAppliedIds(data.map((application) => application.ad_id)));
  }, [user]);

  function toggleFavourite(jobId) {
    const isFavourite = favouriteIds.includes(jobId);

    fetch(API_URL + "/me/favourites/" + jobId, {
      method: isFavourite ? "DELETE" : "POST",
      headers: { Authorization: "Bearer " + user.token },
    }).then((res) => {
      if (!res.ok) {
        return;
      }
      if (isFavourite) {
        setFavouriteIds(favouriteIds.filter((id) => id !== jobId));
      } else {
        setFavouriteIds([...favouriteIds, jobId]);
      }
    });
  }

  function markApplied(jobId) {
    setAppliedIds([...appliedIds, jobId]);
  }

  const types = ["All", ...new Set(jobs.map((job) => job.contract_type).filter((t) => t))];

  const filteredJobs = jobs.filter((job) => {
    const where = job.location + " " + (job.remote === "full" ? "remote" : "");
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase());
    const matchLocation = where.toLowerCase().includes(location.toLowerCase());
    const matchType = type === "All" || job.contract_type === type;
    return matchSearch && matchLocation && matchType;
  });

  const favouriteJobs = jobs.filter((job) => favouriteIds.includes(job.id));

  function clearFilters() {
    setSearch("");
    setLocation("");
    setType("All");
  }

  function handleLogin(loggedUser) {
    localStorage.setItem("token", loggedUser.token);
    setUser(loggedUser);
    if (loggedUser.role === "admin") {
      setPage("admin");
    } else if (loggedUser.role === "employer") {
      setPage(loggedUser.company_id ? "employer" : "employer-info");
    } else {
      setPage("jobs");
    }
  }

  function handleRegister(newUser) {
    localStorage.setItem("token", newUser.token);
    setUser(newUser);
    setPage("jobs");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    setPage("jobs");
  }

  const isUser = user && user.role === "user";
  const isEmployer = user && user.role === "employer";

  return (
    <div className="app">
      <Header page={page} setPage={setPage} user={user} onLogout={handleLogout} />

      <main className="main">
        {page === "login" && <Login onLogin={handleLogin} onGoToRegister={() => setPage("register")} />}

        {page === "register" && <Register onRegister={handleRegister} onGoToLogin={() => setPage("login")} />}

        {page === "admin" && user && user.role === "admin" && <Admin token={user.token} />}

        {page === "employer" && isEmployer && user.company_id && <Employer user={user} />}

        {page === "employer-info" && isEmployer && <EmployerInfo user={user} onUpdate={setUser} />}

        {page === "profile" && isUser && <Profile user={user} onUpdate={setUser} />}

        {page === "applications" && isUser && <MyApplications user={user} />}

        {page === "favourites" && isUser && (
          <MyFavourites favouriteJobs={favouriteJobs} onToggleFavourite={toggleFavourite} />
        )}

        {page === "jobs" && (
          <div>
            <Hero search={search} setSearch={setSearch} location={location} setLocation={setLocation} />
            <Filters types={types} type={type} setType={setType} onClear={clearFilters} />

            <section className="job-list" id="job-list">
              <h2>{filteredJobs.length} JOBS</h2>

              {loading && <p className="status-message">Loading jobs...</p>}

              {error && <p className="status-message status-error">{error}</p>}

              {!loading && !error && filteredJobs.length === 0 && (
                <p className="status-message">No jobs match your search.</p>
              )}

              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  user={user}
                  isFavourite={favouriteIds.includes(job.id)}
                  onToggleFavourite={() => toggleFavourite(job.id)}
                  hasApplied={appliedIds.includes(job.id)}
                  onApplied={() => markApplied(job.id)}
                />
              ))}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;