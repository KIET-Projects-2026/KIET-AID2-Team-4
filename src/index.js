import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DetectionProvider } from "./context/DetectionContext";
<meta name="viewport" content="width=device-width, initial-scale=1.0" />



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <DetectionProvider>
        <App />
      </DetectionProvider>
    </AuthProvider>
  </BrowserRouter>
);
