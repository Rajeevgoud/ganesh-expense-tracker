import React, { useEffect, useState } from "react";

function App() {
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
    <div className="app">
      {/* Theme button */}
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️ Morning Mode" : "🌙 Night Mode"}
      </button>

      {/* Your existing app/routes/components go here */}
    </div>
  );
}

export default App;