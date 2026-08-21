import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🙏 Ganesh Expense Tracker</Link>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        {user ? (
          <>
            <Link to="/admin">Admin Panel</Link>
            <button onClick={logout}>Logout ({user.name})</button>
          </>
        ) : (
          <Link to="/login">Admin Login</Link>
        )}
      </div>
    </nav>
  );
}
