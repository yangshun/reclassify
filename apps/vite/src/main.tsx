import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { cn } from "cn";
import { configure } from "reclassify";
import App from "./App";
import "./index.css";

configure({ cx: cn });

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container was not found.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
