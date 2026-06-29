import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/shared/styles/global_style.css";
import { App } from "@/app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
