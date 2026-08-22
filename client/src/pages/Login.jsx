import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      // Save login details permanently in browser storage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Go to admin page after successful login
      navigate("/admin");

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
        "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="login-container">
      <h1>Admin Login</h1>

      <form onSubmit={login}>
        <label>Username</label>

        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter username"
          required
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />

        {message && (
          <p className="error">
            {message}
          </p>
        )}

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;