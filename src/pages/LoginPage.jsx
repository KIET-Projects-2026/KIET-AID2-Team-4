import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ Redirect AFTER auth state updates
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setMsg("");

    const ok = login(email, password);

    if (!ok) {
      setMsg("Invalid email or password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* 🔥 Animated Almond-Shaped Eye */}
        <div className="eye-wrapper">
          <svg
            className="animated-eye"
            width="180"
            height="120"
            viewBox="0 0 140 90"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="eye-lid"
              d="M10 45 Q70 5 130 45 Q70 85 10 45"
              fill="#ff5722"
            />
            <circle cx="70" cy="45" r="18" fill="white" />
            <circle cx="70" cy="45" r="10" fill="#5a2a18" className="pupil" />
          </svg>
        </div>

        <h3 className="subtitle">YOU GET ONE SHOT</h3>
        <h1 className="title">Don’t Mess Up!</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="input-field"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (msg) setMsg("");
            }}
            required
          />

          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (msg) setMsg("");
            }}
            required
          />

          <button type="submit" className="submit-btn">
            SUBMIT
          </button>
        </form>

        {msg && <p className="error-text">{msg}</p>}

        <p className="switch-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}
