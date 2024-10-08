import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { SpeedInsights } from "@vercel/speed-insights/react"

import AuthProvider from "./providers/AuthProvider.jsx";
import store from "./redux/store/index.js";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      {/* <React.StrictMode> */}
      <App />
      <SpeedInsights />
      {/* </React.StrictMode> */}
    </AuthProvider>
  </Provider>
);
