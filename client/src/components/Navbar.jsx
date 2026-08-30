import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="brand">
        🙏 Ganesh Expense Tracker
      </Link>

      <div className="nav-links">

        <Link to="/">
          Dashboard
        </Link>

        {user ? (
          <>
            <Link to="/admin">
              Admin Panel
            </Link>

            <button onClick={logout}>
              Logout ({user.name})
            </button>
          </>
        ) : (
          <Link to="/login">
            Admin Login
          </Link>
        )}

        {/* Dark / Morning Mode */}
        <button
          className="theme-toggle-navbar"
          onClick={toggleTheme}
          title={
            darkMode
              ? "Switch to Morning Mode"
              : "Switch to Night Mode"
          }
          aria-label={
            darkMode
              ? "Switch to Morning Mode"
              : "Switch to Night Mode"
          }
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

      </div>

    </nav>
  );
}