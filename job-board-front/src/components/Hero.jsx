import pastaFork from "../assets/pasta-fork.jpg";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <p className="hero-kicker">TECH JOBS IN RESTAURANTS</p>
        <h1 className="hero-title">
          FRESH JOBS,
          <br />
          SERVED HOT.
        </h1>
        <p className="hero-subtitle">
          Developers, IT support, data: the restaurants of tomorrow are hiring in the kitchen of tech.
        </p>

        <form className="search" onSubmit={(e) => e.preventDefault()}>
          <input className="search-input" placeholder="Job, keyword…" aria-label="Job or keyword" />
          <input className="search-input search-where" placeholder="City or remote" aria-label="City or remote" />
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