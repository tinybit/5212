import "@fontsource/indie-flower";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { WatchStage } from "@/components/WatchStage";
import "@/styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Screensaver root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <WatchStage screensaver />
  </StrictMode>,
);
