import pastaFork from "../assets/pasta-fork.jpg";

function Hero({ search, setSearch, location, setLocation }) {
  function handleSubmit(event) {
    event.preventDefault();
    document.getElementById("job-list").scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="hero">
      <div className="hero-text">
        <p className="hero-kicker">TECH JOBS IN RESTAURANTS</p>
        <h1 className="hero-title">
          YOUR NEXT JOB
          <br />
          IS ON THE MENU.
        </h1>
        <p className="hero-subtitle">
          Developers, IT support, data: browse the latest tech jobs and apply in a few clicks.
        </p>

        <form className="search" onSubmit={handleSubmit}>
          <input
            className="search-input"
            placeholder="Job, keyword…"
            aria-label="Job or keyword"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            className="search-input search-where"
            placeholder="City or remote"
            aria-label="City or remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button className="search-button" type="submit">SEARCH</button>
        </form>
      </div>

      <div className="hero-photo">
        <img src={pastaFork} alt="Spaghetti with tomato sauce on a golden fork" />
      </div>
    </section>
  );
}

export default Hero;