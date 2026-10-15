function Details({ open, onClick }) {
  return (
    <button
      className={open ? "toggle-button open" : "toggle-button"}
      onClick={onClick}
      aria-label={open ? "Hide description" : "Show description"}
      aria-expanded={open}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

export default Details;