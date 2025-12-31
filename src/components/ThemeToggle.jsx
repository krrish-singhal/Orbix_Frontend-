"use client"

import React from "react"
import { useTheme } from "../context/ThemeContext"

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isDark 
          ? "bg-gradient-to-r from-purple-600 to-blue-600" 
          : "bg-gradient-to-r from-yellow-400 to-orange-400"
      } ${className}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Circle */}
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isDark ? "translate-x-7" : "translate-x-0.5"
        }`}
      >
        {/* Icon */}
        <i 
          className={`text-sm transition-all duration-300 ${
            isDark 
              ? "ri-moon-fill text-purple-600" 
              : "ri-sun-fill text-orange-500"
          }`}
        ></i>
      </div>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <i className={`ri-sun-line text-xs transition-opacity duration-300 ${
          isDark ? "text-white/50" : "text-white"
        }`}></i>
        <i className={`ri-moon-line text-xs transition-opacity duration-300 ${
          isDark ? "text-white" : "text-white/50"
        }`}></i>
      </div>
    </button>
  )
}

export default ThemeToggle