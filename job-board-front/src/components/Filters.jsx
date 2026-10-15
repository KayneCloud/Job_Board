function Filters({ types, type, setType, onClear }) {
  return (
    <div className="filters-wrap">
      <div className="filters">
        <div className="filters-buttons">
          {types.map((name) => (
            <button
              key={name}
              className={type === name ? "filter active" : "filter"}
              onClick={() => setType(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <label className="filters-select">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Contract type">
            {types.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <button className="filter-clear" onClick={onClear}>
          Clear all
        </button>
      </div>
    </div>
  );
}

export default Filters;