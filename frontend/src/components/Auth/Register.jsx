import { useState } from "react";
import axios from "axios";
import styles from "../Auth/Auth.module.css";
import API_BASE_URL from "../../service/core/api.js";

function Register({ onShowLogin }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
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
    setMessageType("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setMessage(
        response.data?.message ||
          "Account created successfully! Redirecting to Login...",
      );

      setMessageType("success");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      // Success message ከታየ በኋላ Login page ክፈት።
      window.setTimeout(() => {
        onShowLogin();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.status === 409
          ? "This email is already registered. Please log in."
          : error.response
            ? "Registration failed. Please check your information."
            : "Cannot connect to the server. Please try again.");

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Create your account</h2>

        <p className={styles.authSubtitle}>
          Create an account to start chatting with AI.
        </p>

        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleChange}
          autoComplete="given-name"
          minLength={1}
          maxLength={100}
          required
          disabled={isLoading}
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleChange}
          autoComplete="family-name"
          minLength={1}
          maxLength={100}
          required
          disabled={isLoading}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
          disabled={isLoading}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={8}
          required
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </button>

        {message && (
          <p
            className={`${styles.authMessage} ${
              messageType === "success"
                ? styles.successMessage
                : styles.errorMessage
            }`}
            role={messageType === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        )}

        <p className={styles.authSwitch}>
          Already have an account?{" "}
          <button type="button" onClick={onShowLogin} disabled={isLoading}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Register;
