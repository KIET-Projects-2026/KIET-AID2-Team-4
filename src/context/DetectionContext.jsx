import React, { createContext, useContext, useState } from "react";

const DetectionContext = createContext();
export const useDetection = () => useContext(DetectionContext);

export const DetectionProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);

  const addSessionResult = (result) => {
    setSessions((prev) => [...prev, result]); // Keep previous results + new result
  };

  return (
    <DetectionContext.Provider value={{ sessions, addSessionResult }}>
      {children}
    </DetectionContext.Provider>
  );
};
