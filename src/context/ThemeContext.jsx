"use client"

import React, { createContext, useState, useContext, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light")

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("orbix-theme")
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    
    // Save to localStorage
    localStorage.setItem("orbix-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light")
  }

  const setLightTheme = () => setTheme("light")
  const setDarkTheme = () => setTheme("dark")

  return (
    <ThemeContext.Provider 
      value={{
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        isDark: theme === "dark"
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext