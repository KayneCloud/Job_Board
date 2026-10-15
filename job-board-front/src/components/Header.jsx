function Header({ page, setPage, user, onLogout }) {
  return (
    <header className="header">
      <div className="header-inner">
        <button className="logo" onClick={() => setPage("jobs")}>
          <span className="logo-tomato">
            <svg width="28" height="28" viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="20" r="13" fill="#B3161B" />
              <ellipse cx="13" cy="16" rx="3" ry="1.8" fill="#FFFFFF" opacity="0.4" />
              <path d="M18 9 L11 6 L15 10.5 L9 12 L15.5 13 L18 11.5 L20.5 13 L27 12 L21 10.5 L25 6 Z" fill="#3F7A35" />
              <path d="M18 9 V4" stroke="#3F7A35" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="logo-name">CHEFS.DEV</span>
        </button>

        <nav className="nav">
          {user && user.role === "admin" && (
            <button
              className={page === "admin" ? "nav-link active" : "nav-link"}
              onClick={() => setPage("admin")}
            >
              ADMIN
            </button>
          )}

          {user && user.role === "employer" && (
            <button
              className={page === "employer-info" ? "nav-link active" : "nav-link"}
              onClick={() => setPage("employer-info")}
            >
              MY INFORMATION
            </button>
          )}

          {user && user.role === "employer" && user.company_id && (
              <button
                className={page === "employer" ? "nav-link active" : "nav-link"}
                onClick={() => setPage("employer")}
              >
                MY JOBS
              </button>
            )}

          {user && user.role === "user" && (
            <button
              className={page === "profile" ? "nav-link active" : "nav-link"}
              onClick={() => setPage("profile")}
            >
              MY PROFILE
            </button>
          )}

          {user && user.role === "user" && (
            <button
              className={page === "applications" ? "nav-link active" : "nav-link"}
              onClick={() => setPage("applications")}
            >
              MY APPLICATIONS
            </button>
          )}

          {user && user.role === "user" && (
            <button
              className={page === "favourites" ? "nav-link active" : "nav-link"}
              onClick={() => setPage("favourites")}
            >
              MY FAVOURITES
            </button>
          )}

          {user && (
            <button className="nav-link outline" onClick={onLogout}>
              LOG OUT
            </button>
          )}

          {!user && (
            <button
              className={page === "login" || page === "register" ? "nav-link outline active" : "nav-link outline"}
              onClick={() => setPage("login")}
            >
              SIGN IN
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;