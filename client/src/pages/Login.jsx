import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/admin");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="form-card small">
      <h1>Admin Login</h1>
      <form onSubmit={login}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {message && <p className="error">{message}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
