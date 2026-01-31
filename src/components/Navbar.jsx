import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className="nav">

      {/* LEFT SIDE → ALWAYS VISIBLE */}
      <div className="nav-left">
        <img src={logo} alt="EyeCare Logo" className="logo-img" />
        <h2 className="logo">EyeCare</h2>
      </div>

      {/* RIGHT SIDE MENU → ONLY AFTER LOGIN */}
      {isAuthenticated && (
        <>
          <ul className={`nav-links ${open ? "nav-active" : ""}`}>
            <li onClick={() => setOpen(false)}>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive ? "active-link" : ""
                }
              >
                Home
              </NavLink>
            </li>

            <li onClick={() => setOpen(false)}>
              <NavLink
                to="/detection"
                className={({ isActive }) =>
                  isActive ? "active-link" : ""
                }
              >
                Detection
              </NavLink>
            </li>

            <li onClick={() => setOpen(false)}>
              <NavLink
                to="/results"
                className={({ isActive }) =>
                  isActive ? "active-link" : ""
                }
              >
                Results
              </NavLink>
            </li>

            <li onClick={() => setOpen(false)}>
              <NavLink
                to="/feedback"
                className={({ isActive }) =>
                  isActive ? "active-link" : ""
                }
              >
                Feedback
              </NavLink>
            </li>

            <li>
  <NavLink
    to="/"
    className={({ isActive }) => (isActive ? "active-link" : "")}
    onClick={handleLogout}
  >
    Logout
  </NavLink>
</li>

          </ul>

          {/* HAMBURGER ICON → ONLY AFTER LOGIN */}
          <div className="hamburger" onClick={() => setOpen(!open)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </>
      )}

    </nav>
  );
}
