import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth.jsx";
import { OwnerProvider } from "./context/owner.jsx";
import { JoinProvider } from "./context/join.jsx";
import { SocketProvider } from "./context/socket.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <OwnerProvider>
      <AuthProvider>
        <JoinProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </JoinProvider>
      </AuthProvider>
    </OwnerProvider>
  </SocketProvider>,
);
