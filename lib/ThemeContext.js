"use client";
/**
 * lib/ThemeContext.js
 * Stores the selected theme in localStorage and applies it as a
 * data-theme attribute on <html> so CSS variables take effect globally.
 */

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "calm", setTheme: () => {} });

export const THEMES = [
  { id: "calm",     label: "Calm Sage",  preview: "bg-gradient-to-br from-sage-100 to-stone-50"     },
  { id: "lavender", label: "Lavender",   preview: "bg-gradient-to-br from-lavender-100 to-stone-50"  },
  { id: "sky",      label: "Clear Sky",  preview: "bg-gradient-to-br from-sky-100 to-stone-50"       },
  { id: "blush",    label: "Warm Blush", preview: "bg-gradient-to-br from-blush-100 to-stone-50"     },
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("calm");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theraflow-theme") || "calm";
    setThemeState(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function setTheme(id) {
    setThemeState(id);
    localStorage.setItem("theraflow-theme", id);
    document.documentElement.setAttribute("data-theme", id);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
