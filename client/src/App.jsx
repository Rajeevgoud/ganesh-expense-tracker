import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

export default function App() {
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

  return (
    <>
      <Navbar />

      {/* Small Dark Mode Button */}
      <button
        className="theme-toggle"
        onClick={() => setDarkMode((prev) => !prev)}
        title={darkMode ? "Switch to Morning Mode" : "Switch to Night Mode"}
        aria-label={darkMode ? "Switch to Morning Mode" : "Switch to Night Mode"}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
  );
}