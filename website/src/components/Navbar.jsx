import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isResidentLoggedIn, setIsResidentLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("ieaResidentToken");
    localStorage.removeItem("ieaAdminToken");
    window.dispatchEvent(new Event("iea-auth-changed"));
    setIsAdminDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeMenus = () => {
    setIsAdminDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="topbar">
      <Link className="logo-crop" to="/" onClick={closeMenus} aria-label="IEA Stays home" />

      {/* Desktop Main Navigation */}
      <nav className="main-nav" aria-label="Primary navigation">
        <a href="/#homes">Homes</a>
        <span>&bull;</span>
        <a href="/#experiences">Experiences</a>
        <span>&bull;</span>
        <a href="/#services">Services</a>
      </nav>

      {/* Desktop Auth and Admin options */}
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
            <Link to="/login">Login</Link>
            <Link className="signup" to="/signup">
              Sign up
            </Link>
          </>
        )}

        {/* 3-dot Dropdown Menu */}
        <div className="admin-menu-container" ref={dropdownRef}>
          <button
            className={`three-dot-btn${isAdminDropdownOpen ? " active" : ""}`}
            type="button"
            onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
            aria-label="Admin options menu"
            aria-expanded={isAdminDropdownOpen}
          >
            &#8942;
          </button>
          {isAdminDropdownOpen && (
            <div className="admin-dropdown-menu">
              {!isResidentLoggedIn && !isAdminLoggedIn && (
                <>
                  <div className="admin-dropdown-header">Resident Portal</div>
                  <Link to="/login" onClick={closeMenus}>
                    Login
                  </Link>
                  <Link to="/signup" onClick={closeMenus}>
                    Sign up
                  </Link>
                  <div className="admin-dropdown-header">Admin Portal</div>
                  <Link to="/admin/login" onClick={closeMenus}>
                    Admin Login
                  </Link>
                  <Link to="/admin/signup" onClick={closeMenus}>
                    Admin Signup
                  </Link>
                </>
              )}
              {isResidentLoggedIn && (
                <>
                  <div className="admin-dropdown-header">Resident Portal</div>
                  <Link to="/visit" onClick={closeMenus}>
                    Book Visit
                  </Link>
                  <button className="admin-dropdown-logout" type="button" onClick={handleLogout}>
                    Log out
                  </button>
                  <div className="admin-dropdown-header">Admin Portal</div>
                  <Link to="/admin/login" onClick={closeMenus}>
                    Admin Login
                  </Link>
                  <Link to="/admin/signup" onClick={closeMenus}>
                    Admin Signup
                  </Link>
                </>
              )}
              {isAdminLoggedIn && (
                <>
                  <div className="admin-dropdown-header">Admin Portal</div>
                  <Link to="/admin" onClick={closeMenus}>
                    Admin Dashboard
                  </Link>
                  <button className="admin-dropdown-logout" type="button" onClick={handleLogout}>
                    Admin Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hamburger Toggle Button for Mobile */}
      <button
        className={`hamburger-btn${isMobileMenuOpen ? " open" : ""}`}
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
      </button>

      {/* Mobile Drawer Navigation overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenus}>
          <div
            className="mobile-menu-drawer"
            ref={mobileMenuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="mobile-main-nav">
              <a href="/#homes" onClick={closeMenus}>
                Homes
              </a>
              <a href="/#experiences" onClick={closeMenus}>
                Experiences
              </a>
              <a href="/#services" onClick={closeMenus}>
                Services
              </a>
            </nav>

            <div className="mobile-divider" />

            <div className="mobile-auth-nav">
              {isResidentLoggedIn ? (
                <>
                  <Link className="mobile-nav-link" to="/visit" onClick={closeMenus}>
                    Book Visit
                  </Link>
                  <button className="mobile-logout-btn" type="button" onClick={handleLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link className="mobile-nav-link" to="/login" onClick={closeMenus}>
                    Login
                  </Link>
                  <Link className="mobile-signup-btn" to="/signup" onClick={closeMenus}>
                    Sign up
                  </Link>
                </>
              )}
            </div>

            <div className="mobile-divider" />

            <div className="mobile-admin-section">
              <div className="mobile-admin-title">Admin Portal</div>
              {isAdminLoggedIn ? (
                <>
                  <Link className="mobile-nav-link" to="/admin" onClick={closeMenus}>
                    Admin Dashboard
                  </Link>
                  <button className="mobile-logout-btn" type="button" onClick={handleLogout}>
                    Admin Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="mobile-nav-link" to="/admin/login" onClick={closeMenus}>
                    Admin Login
                  </Link>
                  <Link className="mobile-nav-link" to="/admin/signup" onClick={closeMenus}>
                    Admin Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
