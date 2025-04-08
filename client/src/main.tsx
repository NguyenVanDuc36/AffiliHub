import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AIAssistantProvider } from "./context/ai-assistant-context";

createRoot(document.getElementById("root")!).render(
  <AIAssistantProvider>
    <App />
  </AIAssistantProvider>
);
