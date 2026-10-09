const filters = ["REMOTE", "SALARY", "JOB TYPE", "DATE POSTED"];

function Filters() {
  return (
    <div className="filters-wrap">
      <div className="filters">
        <button className="filter active">
          FULL-TIME
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {filters.map((name) => (
          <button key={name} className="filter">
            {name}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        ))}

        <button className="filter-clear">CLEAR ALL</button>
      </div>
    </div>
  );
}

export default Filters;