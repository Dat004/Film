import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import AuthProvider from "./providers/AuthProvider.jsx";
import store from "./redux/store/index.js";
import configs from "./configs";
import App from "./App.jsx";
import "./index.css";

const {
  keyConfig: { googleClientId },
} = configs;

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        {/* <React.StrictMode> */}
          <App />
        {/* </React.StrictMode> */}
      </AuthProvider>
    </GoogleOAuthProvider>
  </Provider>
);
