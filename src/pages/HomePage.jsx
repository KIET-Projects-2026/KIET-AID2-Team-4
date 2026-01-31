import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section">

        {/* LEFT CONTENT */}
        <div className="hero-left">
          <h1 className="hero-title">
            {isAuthenticated && user?.name
              ? <>Welcome, <span>{user.name}</span></>
              : "Welcome"}
          </h1>

          <p className="hero-desc">
            EyeCare uses AI-powered eye tracking to monitor your blink patterns
            in real time and detect early signs of eye strain. By analyzing blink
            frequency and consistency, it helps reduce dryness, irritation, and
            fatigue caused by prolonged screen usage.
          </p>
          <div className="hero-features">
  <span>• Blink Detection</span>
  <span>• Fatigue Analysis</span>
  <span>• Real-time Monitoring</span>
</div>



          {!isAuthenticated ? (
            <button
              type="button"
              className="hero-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          ) : (
            <Link to="/detection">
              <button className="hero-btn">
   Start Detection
</button>

            </Link>
          )}
        </div>

        {/* RIGHT IMAGE */}
        <div className="hero-right">
          <div className="hero-image-overlay" />
          <img
            src="/images/eye.jpg"
            alt="Eye illustration"
            className="hero-image"
          />
        </div>

      </section>
    </>
  );
}
