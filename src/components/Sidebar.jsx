"use client"

import { useContext, useEffect } from "react"
import { UserDataContext } from "../context/UserContext"
import { CaptainDataContext } from "../context/CaptainContext"
import { useNavigate } from "react-router-dom"

const Sidebar = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(UserDataContext)
  const { captain, setCaptain } = useContext(CaptainDataContext)
  const navigate = useNavigate()

  const userType = localStorage.getItem("userType") || "user"

  // Close sidebar when clicking escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("captain")
    localStorage.removeItem("userType")
    setUser(null)
    if (setCaptain) setCaptain(null)
    navigate(userType === "captain" ? "/captain-login" : "/login")
    onClose()
  }

  const userMenuItems = [
    {
      icon: "ri-home-4-line",
      label: "Home",
      onClick: () => {
        navigate("/home")
        onClose()
      },
    },
    {
      icon: "ri-history-line",
      label: "Ride History",
      onClick: () => {
        navigate("/ride-history")
        onClose()
      },
    },
    {
      icon: "ri-wallet-3-line",
      label: "Orbix Wallet",
      onClick: () => {
        navigate("/orbix-wallet")
        onClose()
      },
    },
    {
      icon: "ri-user-settings-line",
      label: "Profile Settings",
      onClick: () => {
        navigate("/profile-settings")
        onClose()
      },
    },
    {
      icon: "ri-help-line",
      label: "Help & Support",
      onClick: () => {
        navigate("/help-support")
        onClose()
      },
    },
  ]

  const captainMenuItems = [
    {
      icon: "ri-home-4-line",
      label: "Captain Home",
      onClick: () => {
        navigate("/captain-home")
        onClose()
      },
    },
    {
      icon: "ri-car-line",
      label: "Current Ride",
      onClick: () => {
        navigate("/captain-riding")
        onClose()
      },
    },
    {
      icon: "ri-history-line",
      label: "Ride History",
      onClick: () => {
        navigate("/captain-rides")
        onClose()
      },
    },
    {
      icon: "ri-wallet-3-line",
      label: "Captain Wallet",
      onClick: () => {
        navigate("/captain-wallet")
        onClose()
      },
    },
    {
      icon: "ri-user-settings-line",
      label: "Profile Settings",
      onClick: () => {
        navigate("/captain-profile")
        onClose()
      },
    },
    {
      icon: "ri-help-line",
      label: "Help & Support",
      onClick: () => {
        navigate("/captain-help")
        onClose()
      },
    },
  ]

  const menuItems = userType === "captain" ? captainMenuItems : userMenuItems

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-white z-50 transform transition-all duration-300 ease-in-out shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {userType === "captain" ? "Captain Menu" : "Menu"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <i className="ri-close-line text-lg sm:text-xl text-gray-600"></i>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 ${userType === "captain" ? "bg-green-500" : "bg-blue-500"} rounded-full flex items-center justify-center shadow-md`}
            >
              <i
                className={`${userType === "captain" ? "ri-steering-2-fill" : "ri-user-fill"} text-white text-lg sm:text-xl`}
              ></i>
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-sm sm:text-base text-gray-800">
                {userType === "captain" 
                  ? `${captain?.fullname?.firstname || ''} ${captain?.fullname?.lastname || ''}`.trim() || 'Captain'
                  : `${user?.fullname?.firstname || ''} ${user?.fullname?.lastname || ''}`.trim() || 'User'
                }
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {userType === "captain" ? captain?.email : user?.email}
              </p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                  userType === "captain" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {userType === "captain" ? "Captain" : "User"}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2 flex-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center p-2 sm:p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-sm group"
              >
                <i className={`${item.icon} text-lg sm:text-xl mr-3 text-gray-600 group-hover:text-blue-600 transition-colors`}></i>
                <span className="font-medium text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 sm:p-3 text-left hover:bg-red-50 text-red-600 rounded-xl transition-all duration-200 transform hover:scale-105 group"
            >
              <i className="ri-logout-box-line text-lg sm:text-xl mr-3 group-hover:text-red-700 transition-colors"></i>
              <span className="font-medium text-sm sm:text-base group-hover:text-red-700 transition-colors">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
