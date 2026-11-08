import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/syne";
import "@fontsource-variable/outfit";
import { App } from "./App";
import "./styles.css";
import "./monument.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
