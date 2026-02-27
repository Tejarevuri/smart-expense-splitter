import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api"; // use the API instance with baseURL and auth header

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");

    try {
      const res = await API.post("/auth/signup", { name, email, password });

      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("userInfo", JSON.stringify(res.data));

      window.location.href = "/dashboard"; // redirect to dashboard
    } catch (err) {
      console.error(err?.response?.data || err.message);
      const backendMessage = err.response?.data?.message || "Signup failed";

      if (backendMessage.toLowerCase().includes("already exists")) {
        navigate("/login", {
          state: { email: email.trim(), message: "Account already exists. Please login." },
        });
        return;
      }

      setErrorText(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="surface-card login-wrap">
        <h1 className="panel-title">Create Account</h1>
        <p className="panel-subtitle">Start tracking your portfolio activity in seconds.</p>

        <div className="auth-switch">
          <Link to="/login">Login</Link> | <strong>Sign Up</strong>
        </div>

        {errorText && (
          <p className="auth-error">
            {errorText} <Link to="/login">Go to Login</Link>
          </p>
        )}

        <form className="form-grid" onSubmit={handleSignup}>
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              className="app-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="app-input"
              type="email"
              placeholder="you@example.com"
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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Signup;
