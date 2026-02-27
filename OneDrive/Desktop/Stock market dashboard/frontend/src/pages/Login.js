import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api"; // <-- use the axios instance

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setErrorText(location.state.message);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    try {
      // Use API instance for requests
      const res = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // Store user info in localStorage
      localStorage.setItem("userInfo", JSON.stringify(res.data));

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || "Login failed";
      setErrorText(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="surface-card login-wrap">
        <h1 className="panel-title">Stock Nexus</h1>
        <p className="panel-subtitle">Sign in to track quotes and record your trades.</p>

        <div className="auth-switch">
          <strong>Login</strong> | <Link to="/signup">Sign Up</Link>
        </div>

        {errorText && (
          <p className="auth-error">
            {errorText}{" "}
            {errorText.toLowerCase().includes("invalid") && (
              <span>Try Sign Up if you are new.</span>
            )}
          </p>
        )}

        <form className="form-grid" onSubmit={handleLogin}>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="app-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="app-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Enter Dashboard"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Login;