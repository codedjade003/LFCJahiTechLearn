import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ModalProvider } from "./context/ModalContext";
import App from "./App";
import "./App.css"
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
