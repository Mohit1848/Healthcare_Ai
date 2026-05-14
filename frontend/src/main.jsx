import React from "react";
import { createRoot } from "react-dom/client";
import HealthGuardPrototype from "./HealthGuardPrototype.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HealthGuardPrototype />
  </React.StrictMode>,
);
