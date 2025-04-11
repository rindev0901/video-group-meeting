import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { ConfigProvider } from "antd";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorTextBase: "#ffffff",
          colorTextSecondary: "#e8e8e8",
          colorPrimary: "#000000",
          // Alias Token
          colorBgContainer: "#454552",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
