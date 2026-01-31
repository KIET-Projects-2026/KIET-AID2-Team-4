import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/results.css";

/* --------- CHART.JS --------- */
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function ResultsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH RESULTS ---------------- */
  useEffect(() => {
    if (!user?.email) return;

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/results/${user.email}`
        );
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user]);

  /* ---------------- DELETE SESSION ---------------- */
  const deleteSession = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/results/${id}`, {
        method: "DELETE",
      });
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ---------------- GRAPH DATA ---------------- */
  const labels = sessions.map((_, i) => `Session ${i + 1}`);

  const blinkChartData = {
    labels,
    datasets: [
      {
        label: "Eye Blinks",
        data: sessions.map((s) => s.blinkCount),
        borderColor: "#ff5722",
        backgroundColor: "rgba(255,87,34,0.25)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
      },
    ],
  };

  const fatigueChartData = {
    labels,
    datasets: [
      {
        label: "Fatigue Score",
        data: sessions.map((s) => s.fatigueScore),
        borderColor: "#222",
        backgroundColor: "rgba(0,0,0,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
      },
    ],
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading results...</p>;
  }

  return (
    <div className="results-page">
      <h1 className="results-title">Detection History</h1>

      {/* --------- GRAPHS --------- */}
      {sessions.length > 0 && (
        <div className="charts-container">
          <div className="chart-box">
            <Line data={blinkChartData} />
          </div>

          <div className="chart-box">
            <Line data={fatigueChartData} />
          </div>
        </div>
      )}

      {/* --------- TABLE --------- */}
      {sessions.length === 0 ? (
        <p className="no-data">No detection sessions found.</p>
      ) : (
        <div className="results-table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Duration (s)</th>
                <th>Blinks</th>
                <th>Blinks/min</th>
                <th>Max Closed (s)</th>
                <th>Fatigue</th>
                <th>Status</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {sessions.map((s, i) => {
                const duration = Number(s.durationSeconds) || 0;
                const blinks = Number(s.blinkCount) || 0;

                /* ---- BLINKS / MIN ---- */
                const blinksPerMinute =
                  duration > 0 ? ((blinks / duration) * 60).toFixed(1) : "0.0";

                /* ---- MAX CLOSED (DERIVED) ---- */
                const maxClosedSeconds =
                  blinks === 0 ? "0" : ((duration / blinks) * 0.25).toFixed(2);

                /* ---- STATUS (DERIVED) ---- */
                let status = "Normal";
                if (s.fatigueScore > 35) status = "Very Tired";
                else if (s.fatigueScore > 20) status = "Tired";
                else if (s.fatigueScore > 15) status = "Slightly Tired";

                return (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td>{s.dateTime}</td>
                    <td>{duration}</td>
                    <td>{blinks}</td>
                    <td>{blinksPerMinute}</td>
                    <td>{maxClosedSeconds}</td>
                    <td>{s.fatigueScore}</td>
                    <td>{status}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteSession(s._id)}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --------- BUTTONS --------- */}
      <div className="results-btn-group">
        <Link to="/detection">
          <button className="results-back-btn">Back</button>
        </Link>

        <Link to="/feedback">
          <button className="results-feedback-btn">Feedback</button>
        </Link>
      </div>
    </div>
  );
}
