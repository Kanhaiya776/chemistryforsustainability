import React from "react";
import App from "./component/App";

import { createRoot } from "react-dom/client";

const element = document.getElementById("acs-react-app");

if (element) {
  const root = createRoot(element);
  root.render(<App />);
} else {
  console.error("Element with ID 'acs-react-app' not found.");
}
