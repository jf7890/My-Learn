import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { BrandingProvider } from "./BrandingContext.jsx";
import "./styles.css";
import "./workspace.css";
import "./learning-theme.css";
try { document.documentElement.dataset.theme = localStorage.getItem("my-learn-theme") || "soft"; } catch { document.documentElement.dataset.theme = "soft"; }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrandingProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BrandingProvider>
  </React.StrictMode>
);
