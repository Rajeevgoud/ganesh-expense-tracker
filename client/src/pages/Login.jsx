import { useState } from "react";
import { api } from "../api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      const response = await api.post("/auth/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Login successful");

      if (onLogin) {
        onLogin(response.data.user);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>

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

        {message && <p className="error">{message}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
