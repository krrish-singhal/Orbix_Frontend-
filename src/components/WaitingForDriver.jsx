"use client";
import React from "react";

function WaitingForDriver({ ride, setShowWaitingForDriver, setShowVehicleFound, otp }) {
  if (!ride) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center py-3 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <button 
            onClick={() => setShowWaitingForDriver(false)}
            className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          />
        </div>

        <div className="px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i className="ri-check-circle-line text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Driver Found!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Your captain is on the way</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-4 sm:p-6 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {(ride?.captain?.fullname?.firstname?.[0] || 'C').toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                  {ride?.captain?.fullname?.firstname 
                    ? `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname || ''}`.trim()
                    : 'Captain'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {ride?.captain?.vehicle?.plate || 'DL 8C AB 1234'}
                </p>
              </div>
              <button className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg">
                <i className="ri-phone-fill text-white text-xl"></i>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-key-2-line text-white text-2xl"></i>
              </div>
              <h4 className="font-bold text-lg text-blue-900 dark:text-blue-100 mb-2">Your Ride OTP</h4>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border-2 border-blue-300 dark:border-blue-600 shadow-lg">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                  {otp ?? ride?.otp ?? '------'}
                </span>
                {/* Debug info - remove this in production */}
                <div className="text-xs text-gray-500 mt-2">
                  <div>OTP prop: {otp}</div>
                  <div>Ride OTP: {ride?.otp}</div>
                </div>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Share this OTP with your captain to start the ride
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowWaitingForDriver(false)}
            className="w-full py-3 sm:py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 border border-red-200 dark:border-red-800"
          >
            Cancel Ride
          </button>
        </div>
      </div>
    </div>
  );
}

export default WaitingForDriver;
