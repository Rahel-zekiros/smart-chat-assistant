import { useState } from "react";
import axios from "axios";
import styles from "./Auth.module.css";
import API_BASE_URL from "../../service/core/api.js";

function Login({ onShowRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);

      const user = response.data.user;
      const token = response.data.token || response.data.accessToken;

      if (!user) {
        throw new Error(
          "Login succeeded, but the server did not return user information.",
        );
      }

      if (token) {
        localStorage.setItem("authToken", token);
      }

      localStorage.setItem("activeUser", JSON.stringify(user));

      onLoginSuccess(user);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Welcome back</h2>

        <p className={styles.authSubtitle}>
          Sign in to continue your conversations.
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </button>

        {message && (
          <p className={styles.authMessage} role="status">
            {message}
          </p>
        )}

        <p className={styles.authSwitch}>
          Don't have an account?{" "}
          <button type="button" onClick={onShowRegister}>
            Register
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
