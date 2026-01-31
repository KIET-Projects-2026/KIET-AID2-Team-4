import React, { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { useNavigate, Link } from "react-router-dom"; // ✅ FIX 1
import { useAuth } from "../context/AuthContext";
import "../styles/detection.css";

/* ================= CONSTANTS ================= */
const LEFT = [33, 160, 158, 133, 153, 144];
const RIGHT = [263, 387, 385, 362, 380, 373];

const EAR_THRESHOLD = 0.23;
const MIN_CLOSED_FRAMES = 3;

/* ================= HELPERS ================= */
function dist(a, b) {
  if (!a || !b) return 0;
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function EAR(landmarks, idx) {
  const pts = idx.map((i) => landmarks[i]);
  if (pts.some((p) => !p)) return 0;

  const [p1, p2, p3, p4, p5, p6] = pts;
  const h = dist(p1, p4);
  if (!h) return 0;

  return (dist(p2, p6) + dist(p3, p5)) / (2 * h);
}

/* ================= FATIGUE STATUS ================= */
function getFatigueStatus(score) {
  if (score <= 15) return "Normal";
  if (score <= 20) return "Slightly Tired";
  if (score <= 35) return "Tired";
  return "Very Tired";
}

export default function DetectionPage() {
  const vidRef = useRef(null);
  const canRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const stoppedRef = useRef(false);

  const alertAudioRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [eyeStatus, setEyeStatus] = useState("Open");
  const [personCount, setPersonCount] = useState(0);
  const [blinkCount, setBlinkCount] = useState(0);
  const [fatigueScore, setFatigueScore] = useState(0);
  const [fatigueStatus, setFatigueStatus] = useState("Normal");

  const blinkRef = useRef(0);
  const blinkTimestamps = useRef([]);
  const closedFrames = useRef(0);
  const wasClosed = useRef(false);
  const earHistory = useRef([]);
  const startTime = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  /* ================= INIT AUDIO ================= */
  useEffect(() => {
    alertAudioRef.current = new Audio("/sounds/alert.mp3");
    alertAudioRef.current.volume = 0.8;
  }, []);

  /* ================= INIT FACEMESH ================= */
  useEffect(() => {
    faceMeshRef.current = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    return () => cameraRef.current?.stop();
  }, []);

  /* ================= RUN CAMERA ================= */
  useEffect(() => {
    if (!isRunning) return;

    stoppedRef.current = false;
    const video = vidRef.current;
    const canvas = canRef.current;
    const ctx = canvas.getContext("2d");

    faceMeshRef.current.onResults((res) => {
      if (stoppedRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(res.image, 0, 0, canvas.width, canvas.height);

      const faces = res.multiFaceLandmarks?.length || 0;
      setPersonCount(faces);
      if (!faces) return;

      const lm = res.multiFaceLandmarks[0];
      const l = EAR(lm, LEFT);
      const r = EAR(lm, RIGHT);
      if (!l || !r) return;

      const ear = (l + r) / 2;

      earHistory.current.push(ear);
      if (earHistory.current.length > 8) earHistory.current.shift();

      const smoothEAR =
        earHistory.current.reduce((a, b) => a + b, 0) /
        earHistory.current.length;

      const closed = smoothEAR < EAR_THRESHOLD;
      setEyeStatus(closed ? "Closed" : "Open");

      if (closed) {
        closedFrames.current++;
      } else {
        if (wasClosed.current && closedFrames.current >= MIN_CLOSED_FRAMES) {
          blinkRef.current++;
          setBlinkCount(blinkRef.current);
          blinkTimestamps.current.push(Date.now());

          // 🔔 sound on blink
          alertAudioRef.current.currentTime = 0;
          alertAudioRef.current.play().catch(() => {});
        }
        closedFrames.current = 0;
      }
      wasClosed.current = closed;

      const now = Date.now();
      const elapsedMin = Math.max(
        (now - startTime.current) / 60000,
        0.5
      );

      const blinkRate = blinkTimestamps.current.filter(
        (t) => now - t <= 60000
      ).length;

      let blinkScore = 0;
      if (blinkRate < 10) blinkScore = (10 - blinkRate) * 3;
      else if (blinkRate > 25) blinkScore = (blinkRate - 25) * 2;
      blinkScore = Math.min(blinkScore, 35);

      let eyeScore = 0;
      if (smoothEAR < 0.27)
        eyeScore = Math.min((0.27 - smoothEAR) * 220, 45);

      let timeScore = 0;
      if (blinkScore > 8 || eyeScore > 8)
        timeScore = Math.min(elapsedMin * 3, 20);

      const total = Math.min(
        Math.round(blinkScore + eyeScore + timeScore),
        100
      );

      setFatigueScore(total);
      setFatigueStatus(getFatigueStatus(total));
    });

    cameraRef.current = new Camera(video, {
      onFrame: async () => {
        if (!stoppedRef.current)
          await faceMeshRef.current.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    cameraRef.current.start();
    return () => cameraRef.current?.stop();
  }, [isRunning]);

  /* ================= CONTROLS ================= */
  const startDetection = () => {
    earHistory.current = [];
    blinkRef.current = 0;
    blinkTimestamps.current = [];
    closedFrames.current = 0;
    wasClosed.current = false;

    setBlinkCount(0);
    setFatigueScore(0);
    setFatigueStatus("Normal");

    startTime.current = Date.now();
    setIsRunning(true);
  };

  const stopDetection = () => {
    stoppedRef.current = true;
    cameraRef.current?.stop();
  };

  // ✅ FIX 2: DEFINE FUNCTION
  const goBackToStart = () => {
    stoppedRef.current = true;
    cameraRef.current?.stop();
    setIsRunning(false);
  };

  const finish = async () => {
    const sec = (Date.now() - startTime.current) / 1000;

    await fetch("http://localhost:5000/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.email || "demo-user",
        dateTime: new Date().toLocaleString(),
        durationSeconds: sec.toFixed(1),
        blinkCount,
        fatigueScore,
        fatigueStatus,
        persons: personCount,
      }),
    });

    navigate("/results");
  };

  


  /* ================= UI ================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/eye_strain.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(10px)",
        }}
      />

      <div className="detect-page" style={{ position: "relative", zIndex: 1 }}>
        <h1 className="detect-heading">Eye Blink & Fatigue Detection</h1>

        {!isRunning && (
          <div className="detect-card">
            <img src="/images/camera.png" alt="Camera" className="detect-camera-img" />
            <p className="detect-text">
              Click “Start Detection” to begin real-time eye blink and fatigue analysis.
            </p>
            <div className="detect-btn-group">
              <button className="start-btn" onClick={startDetection}>
                Start Detection
              </button>
              <Link to="/home">
                <button className="home-btn">Back</button>
              </Link>
            </div>
          </div>
        )}

        {isRunning && (
          <div style={{ display: "flex", gap: "28px", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                width: "630px",
                borderRadius: "28px",
                overflow: "hidden",
                background: "#000",
              }}
            >
              <canvas ref={canRef} width={640} height={480} style={{ width: "100%" }} />
              <video ref={vidRef} autoPlay playsInline hidden />

              <button
                onClick={stopDetection}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(0,0,0,0.75)",
                  color: "#fff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "20px",
                }}
              >
                ⏹ Stop
              </button>
            </div>

            <div
              style={{
                width: "300px",
                background: "rgba(255,255,255,0.9)",
                borderRadius: "16px",
                padding: "22px",
                margin: "0px auto 0 auto",
    display: "block",
              }}
            >
              <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  }}
>
  <h3
    style={{
      color: "#ff5722",
      marginBottom: "12px",
      marginTop: "10px",
      fontSize: "32px",
      fontWeight: "700",
    }}
  >
    Live Analysis
  </h3>

  <p><strong>Eye Status:</strong> {eyeStatus}</p>
  <p><strong>Blink Count:</strong> {blinkCount}</p>
  <p><strong>People Detected:</strong> {personCount}</p>
  <p><strong>Fatigue Score:</strong> {fatigueScore} / 100</p>
</div>


              <button
                className="start-btn"
                style={{ width: "60%", marginTop: "100px", margin: "30px auto 0 auto",
    display: "block", }}
                onClick={finish}
              >
                View Results
              </button>

              <button
                className="home-btn"
                style={{ width: "60%", marginTop: "20px",marginBottom:"10px", margin: "20px auto 0 auto",
    display: "block", }}
                onClick={goBackToStart}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
