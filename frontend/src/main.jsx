import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: "rgba(13,17,23,0.95)",
            color: "#f0f4f8",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            padding: "12px 16px",
          },
          success: { iconTheme: { primary: "#22c55e", secondary: "#060a0f" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#060a0f" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
