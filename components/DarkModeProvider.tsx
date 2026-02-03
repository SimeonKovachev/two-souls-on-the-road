"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem("two-souls-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setIsDarkMode(settings.darkMode || false);
      } catch {
        // Ignore
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, isLoaded]);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);

    // Update settings in localStorage
    const stored = localStorage.getItem("two-souls-settings");
    let settings = {};
    if (stored) {
      try {
        settings = JSON.parse(stored);
      } catch {
        // Ignore
      }
    }
    localStorage.setItem(
      "two-souls-settings",
      JSON.stringify({ ...settings, darkMode: newValue })
    );
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}
