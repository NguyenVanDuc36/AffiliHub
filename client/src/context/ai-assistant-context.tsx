import { createContext, useContext, useState, ReactNode } from "react";

interface AIAssistantContextType {
  isOpen: boolean;
  toggleAIAssistant: () => void;
  aiPrompt: string;
  setAIPrompt: (prompt: string) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");

  const toggleAIAssistant = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <AIAssistantContext.Provider value={{ isOpen, toggleAIAssistant, aiPrompt, setAIPrompt }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  
  return context;
}
