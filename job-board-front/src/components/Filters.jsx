function Filters({ types, type, setType, onClear }) {
  return (
    <div className="filters-wrap">
      <div className="filters">
        {types.map((name) => (
          <button
            key={name}
            className={type === name ? "filter active" : "filter"}
            onClick={() => setType(name)}
          >
            {name}
          </button>
        ))}

        <button className="filter-clear" onClick={onClear}>
          Clear all
        </button>
      </div>
    </div>
  );
}

export default Filters;