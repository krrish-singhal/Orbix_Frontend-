"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

const Navbar = ({ userType = "user" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const userMenuItems = [
    { name: "Home", path: "/home", icon: "home" },
    { name: "Ride History", path: "/ride-history", icon: "history" },
    { name: "Orbix Wallet", path: "/orbix-wallet", icon: "wallet" },
    { name: "Profile Settings", path: "/profile-settings", icon: "profile" },
    { name: "Help & Support", path: "/help-support", icon: "help" },
    { name: "Logout", path: "/logout", icon: "logout" },
  ]

  const captainMenuItems = [
    { name: "Home", path: "/captain-home", icon: "home" },
    { name: "Ride History", path: "/captain-ride-history", icon: "history" },
    { name: "Orbix Wallet", path: "/captain-wallet", icon: "wallet" },
    { name: "Profile Settings", path: "/captain-profile-settings", icon: "profile" },
    { name: "Help & Support", path: "/captain-help-support", icon: "help" },
    { name: "Logout", path: "/captain-logout", icon: "logout" },
  ]

  const menuItems = userType === "captain" ? captainMenuItems : userMenuItems

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      history: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      wallet: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      profile: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      help: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    }
    return icons[iconName] || icons.home
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {userType === "captain" ? "Captain Menu" : "Orbix Ride"}
              </h2>
              <p className="text-sm text-gray-600">
                {userType === "captain" ? "Driver Dashboard" : "Your ride companion"}
              </p>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path)
                setIsMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                isActive(item.path) ? "bg-gray-100 border-r-4 border-black" : ""
              }`}
            >
              <div className={`${isActive(item.path) ? "text-black" : "text-gray-600"}`}>{getIcon(item.icon)}</div>
              <span className={`font-medium ${isActive(item.path) ? "text-black" : "text-gray-700"}`}>{item.name}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">Orbix Ride v1.0</p>
            <p className="text-xs text-gray-400 mt-1">Your trusted ride partner</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
