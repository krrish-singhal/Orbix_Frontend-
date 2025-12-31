"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"

const NavigationHeader = ({ title, showBackButton = false, onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 mr-2"
              >
                <i className="ri-arrow-left-line text-xl text-gray-700"></i>
              </button>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 mr-2"
              >
                <i className="ri-menu-line text-xl text-gray-700"></i>
              </button>
            )}
            <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <i className="ri-notification-3-line text-xl text-gray-700"></i>
            </button>
          </div>
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}

export default NavigationHeader
