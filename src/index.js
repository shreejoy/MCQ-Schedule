import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { CookiesProvider } from "react-cookie";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
