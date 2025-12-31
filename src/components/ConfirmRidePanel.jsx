"use client"

import React from "react"

const ConfirmRide = ({ selectedVehicle, pickup, destination, onConfirm, onClose, fare }) => {

  if (!selectedVehicle) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 p-4 rounded-t-3xl shadow-2xl">
      <h5
        className="p-1 text-center w-[93%] cursor-pointer"
        onClick={onClose}
      >
        <i className="text-3xl text-gray-400 dark:text-gray-500 ri-arrow-down-wide-line"></i>
      </h5>
      
      <h3 className="text-2xl font-semibold mb-5 text-center text-gray-900 dark:text-white">
        Confirm Your Ride
      </h3>

      {/* Selected Vehicle Details */}
      <div className="flex items-center mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <img 
          src={selectedVehicle.image} 
          alt={selectedVehicle.name}
          className="w-20 h-16 object-cover rounded-lg mr-4"
        />
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedVehicle.name}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedVehicle.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Capacity: {selectedVehicle.capacity} passengers</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">₹{selectedVehicle.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVehicle.time}</p>
        </div>
      </div>

      {/* Trip Details */}
      <div className="mb-6">
        <div className="flex items-start mb-3">
          <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mt-2 mr-3"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pickup</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{pickup}</p>
          </div>
        </div>
        
        <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-1.5 h-4 mb-3"></div>
        
        <div className="flex items-start">
          <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full mt-2 mr-3"></div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{destination}</p>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
      >
        Confirm Ride - ₹{selectedVehicle.price}
      </button>
    </div>
  )
}

export default ConfirmRide