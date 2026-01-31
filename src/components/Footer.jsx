import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaTwitter,
} from "react-icons/fa";
import logo from "../assets/logo.png"; // ✅ LOGO IMPORT
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      {/* TOP SECTION */}
      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-left">
          <div className="footer-brand">
            <img src={logo} alt="EyeCare Logo" className="footer-logo-img" />
            <h2 className="footer-logo-text">EyeCare</h2>
          </div>

          <p className="footer-desc">
            EyeCare is an AI-powered eye blink and fatigue detection system
            designed to monitor eye health and reduce digital eye strain using
            computer vision.
          </p>
        </div>

        {/* MIDDLE */}
        <div className="footer-middle">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/detection">Detection</Link></li>
            <li><Link to="/results">Results</Link></li>
            <li><Link to="/feedback">Feedback</Link></li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="footer-right">
          <h3 className="footer-title">Follow Us</h3>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaLinkedin />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn">
              <FaTwitter />
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        © 2025 EyeCare. All rights reserved.
      </div>

    </footer>
  );
}
