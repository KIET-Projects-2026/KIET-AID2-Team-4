import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout from "./layouts/Mainlayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DetectionPage from "./pages/DetectionPage";
import ResultsPage from "./pages/ResultsPage";
import FeedbackPage from "./pages/FeedbackPage";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* 🌍 ALL PAGES WITH NAVBAR + FOOTER */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        <Route
          path="/detection"
          element={isAuthenticated ? <DetectionPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/results"
          element={isAuthenticated ? <ResultsPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/feedback"
          element={isAuthenticated ? <FeedbackPage /> : <Navigate to="/login" />}
        />
      </Route>

      {/* 🔐 AUTH PAGES (NO FOOTER/NAVBAR if you want later) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ❌ FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
