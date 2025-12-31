import React from 'react'

function LookingForDriver({ setShowVehicleFound, selectedVehicle, pickup, destination }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <button 
            onClick={() => setShowVehicleFound(false)}
            className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          />
        </div>

        <div className="px-4 sm:px-6 pb-6 sm:pb-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Looking for a Driver
            </h3>
            <p className="text-gray-600 dark:text-gray-400">We're finding the best driver for you</p>
          </div>

          {/* Vehicle Image */}
          <div className="flex justify-center mb-6">
            <div className="relative bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <img
                className="h-24 sm:h-32 w-auto object-contain"
                src={selectedVehicle?.image || "https://tse4.mm.bing.net/th/id/OIP.ymjpxr4RPlwbLenCbbpYywHaE7?rs=1&pid=ImgDetMain&o=7&rm=3"}
                alt={selectedVehicle?.name || "vehicle"}
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <i className="ri-map-pin-user-fill text-green-600 dark:text-green-400 text-lg"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">Pickup Address</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pickup || 'Your pickup location'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <i className="ri-map-pin-2-fill text-red-600 dark:text-red-400 text-lg"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">Destination Address</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{destination || 'Your destination'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <i className="ri-currency-line text-green-600 dark:text-green-400 text-lg"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedVehicle?.price ? `₹${selectedVehicle.price}` : '₹120'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cash Payment</p>
              </div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 dark:border-green-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Searching for nearby drivers...
              </p>
              <div className="flex justify-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LookingForDriver
