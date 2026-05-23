import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isResidentLoggedIn, setIsResidentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsResidentLoggedIn(Boolean(localStorage.getItem("ieaResidentToken")));
      setIsAdminLoggedIn(Boolean(localStorage.getItem("ieaAdminToken")));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("iea-auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("iea-auth-changed", syncAuthState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ieaResidentToken");
    localStorage.removeItem("ieaAdminToken");
    window.dispatchEvent(new Event("iea-auth-changed"));
  };

  return (
    <header className="topbar">
      <Link className="logo-crop" to="/" aria-label="IEA Stays home" />

      <nav className="main-nav" aria-label="Primary navigation">
        <a href="/#homes">Homes</a>
        <span>&bull;</span>
        <a href="/#experiences">Experiences</a>
        <span>&bull;</span>
        <a href="/#services">Services</a>
      </nav>

      <div className="auth-nav">
        {isResidentLoggedIn ? (
          <>
            <Link to="/visit">Book Visit</Link>
            <button className="auth-link-button" type="button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/admin/login">Admin</Link>
            <Link to="/login">Login</Link>
            <Link className="signup" to="/signup">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
