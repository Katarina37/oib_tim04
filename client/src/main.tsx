import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TitleBar } from "../electron/window_frame/WindowFrame.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ServiceProvider } from "./contexts/ServiceContext.tsx";
import { NotificationCenterProvider } from "./contexts/NotificationCenterContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ServiceProvider>
          <NotificationCenterProvider>
            <TitleBar />
            <div style={{ paddingTop: 0 }}>
              <App />
            </div>
          </NotificationCenterProvider>
        </ServiceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
