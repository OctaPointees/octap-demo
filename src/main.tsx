import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./theme.css";

import OctaPAppEntryPoint from "./app/index.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OctaPAppEntryPoint />
  </StrictMode>,
);
