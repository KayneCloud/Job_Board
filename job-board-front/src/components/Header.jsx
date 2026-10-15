import { useState } from "react";

function Header({ page, setPage, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function goTo(newPage) {
    setPage(newPage);
    setMenuOpen(false);
  }

  function handleLogout() {
    onLogout();
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="header-inner">
        <button className="logo" onClick={() => goTo("jobs")}>
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

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <nav className={menuOpen ? "nav open" : "nav"}>
          {user && user.role === "admin" && (
            <button
              className={page === "admin" ? "nav-link active" : "nav-link"}
              onClick={() => goTo("admin")}
            >
              ADMIN
            </button>
          )}

          {user && user.role === "employer" && (
            <button
              className={page === "employer-info" ? "nav-link active" : "nav-link"}
              onClick={() => goTo("employer-info")}
            >
              MY INFORMATION
            </button>
          )}

          {user && user.role === "employer" && user.company_id && (
            <button
              className={page === "employer" ? "nav-link active" : "nav-link"}
              onClick={() => goTo("employer")}
            >
              MY JOBS
            </button>
          )}

          {user && user.role === "user" && (
            <button
              className={page === "profile" ? "nav-link active" : "nav-link"}
              onClick={() => goTo("profile")}
            >
              MY PROFILE
            </button>
          )}

          {user && user.role === "user" && (
            <button
              className={page === "applications" ? "nav-link active" : "nav-link"}
              onClick={() => goTo("applications")}
            >
              MY APPLICATIONS
            </button>
          )}

          {user && user.role === "user" && (
            <button
              className={page === "favourites" ? "nav-link active" : "nav-link"}
              onClick={() => goTo("favourites")}
            >
              MY FAVOURITES
            </button>
          )}

          {user && (
            <button className="nav-link outline" onClick={handleLogout}>
              LOG OUT
            </button>
          )}

          {!user && (
            <button
              className={page === "login" || page === "register" ? "nav-link outline active" : "nav-link outline"}
              onClick={() => goTo("login")}
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