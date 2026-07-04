import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: '"Inter", system-ui, sans-serif',
        },
        cssVar: {
          prefix: "ant",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);
