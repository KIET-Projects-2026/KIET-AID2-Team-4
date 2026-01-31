import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/feedback.css";

export default function FeedbackPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 0,
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setForm({ ...form, rating: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save locally
    const oldFeedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");

    const updated = [
      ...oldFeedbacks,
      { ...form, date: new Date().toLocaleString() },
    ];

    localStorage.setItem("feedbacks", JSON.stringify(updated));

    setSubmitted(true);

    // Reset fields
    setForm({
      name: "",
      email: "",
      rating: 0,
      message: "",
    });

    // 🔁 Redirect to Home after submit
    setTimeout(() => {
      navigate("/home");
    }, 1200);
  };

  return (
    <div className="feedback-page">
      <h1 className="feedback-title">We Value Your Feedback</h1>

      {submitted && (
        <p className="success">Thank you! Feedback submitted ✔</p>
      )}

      <form className="feedback-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          className="feedback-input"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          className="feedback-input"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* ⭐ STAR RATING */}
        <div className="rating-box">
          <label>Rating:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= form.rating ? "star filled" : "star"}
                onClick={() => handleRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <textarea
          name="message"
          className="feedback-textarea"
          placeholder="Write your feedback..."
          value={form.message}
          onChange={handleChange}
          required
        />

        <button type="submit" className="feedback-btn">
          Submit Feedback
        </button>
      </form>

      <div className="feedback-nav-wrapper">
        <Link to="/results">
          <button className="feedback-back-btn">Back</button>
        </Link>
      </div>
    </div>
  );
}
