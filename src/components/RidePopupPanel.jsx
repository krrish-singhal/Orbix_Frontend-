"use client";
import React from "react";
import { getVehicleImage } from '../../utils/mapUtils';

// Vehicle image URL logic (copied from LookingForDriver)
const getVehicleImageUrl = (vehicleType) => {
  if (vehicleType === "car")
    return "https://tse4.mm.bing.net/th/id/OIP.ymjpxr4RPlwbLenCbbpYywHaE7?rs=1&pid=ImgDetMain&o=7&rm=3";
  if (vehicleType === "moto")
    return "https://static.vecteezy.com/system/resources/previews/045/840/640/non_2x/food-delivery-man-riding-scooter-vector.jpg";
  return "https://i.pinimg.com/originals/2c/5e/14/2c5e1485755e664bcf7614cc4d492003.png";
};

function RidePopupPanel({ 
  ride, 
  setRidePopupPanel, 
  setConfirmRidePopupPanel, 
  confirmRide, 
  declineRide 
}) {

  // Determine if OTP is filled (if OTP input is present in this panel)
  // You may need to adjust this logic based on your actual OTP state/prop
  // For now, fallback to always true if not used
  const otpFilled = true;

  if (!ride) return null;

  const handleAccept = () => {
    confirmRide();
  };

  const handleDecline = () => {
    declineRide();
    setRidePopupPanel(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none" style={{ background: 'rgba(0,0,0,0.15)' }}>
      <div className="w-full max-w-md rounded-3xl shadow-2xl border-t border-gray-200 dark:border-gray-700 animate-slide-up max-h-[85vh] overflow-y-auto pointer-events-auto" style={{ background: '#fff', borderRadius: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        {/* Handle Bar */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-notification-3-fill text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              New Ride Request!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">A passenger is waiting for you</p>
          </div>
        </div>
        
        {/* Ride Details */}
        <div className="px-6 py-4">
          {/* Passenger Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {(ride.user?.fullname?.firstname?.[0] || 
                    ride.user?.name?.[0] || 
                    'P').toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-base text-gray-900 dark:text-white mb-0.5">
                  Passenger
                </div>
                <h4 className="font-semibold text-lg text-gray-800 dark:text-white">
                  {ride.user?.fullname?.firstname 
                    ? `${ride.user.fullname.firstname} ${ride.user.fullname.lastname || ''}`.trim()
                    : ride.user?.name || 'Not Available'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Ride ID: #{ride._id?.slice(-6) || ride.rideId?.slice(-6)}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <i className="ri-star-fill mr-1"></i>
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {ride.distance ? `${ride.distance} km` : '2.5 km'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
                  ₹{ride.fare}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {ride.duration ? `${ride.duration} mins` : '8 mins'}
                </div>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <i className="ri-map-pin-user-fill text-white text-lg"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-white">Pickup Location</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{ride.pickup}</p>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                {ride.pickupTime || '2 mins'}
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <i className="ri-map-pin-2-fill text-white text-lg"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 dark:text-white">Drop Location</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{ride.destination}</p>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {ride.duration ? `${ride.duration} mins` : '8 mins'}
              </div>
            </div>
          </div>

          {/* Vehicle Type & Earnings */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center">
                  <img
                    src={getVehicleImageUrl(ride.vehicleType)}
                    alt={ride.vehicleType || 'Car'}
                    className="object-contain"
                    style={{ width: '80px', height: '80px' }}
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {ride.vehicleType?.charAt(0).toUpperCase() + ride.vehicleType?.slice(1) || 'Car'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle Type</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Earnings
                </div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  ₹{Math.round(ride.fare * 0.8)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (OTP Panel) */}
          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleDecline}
              className="flex-1 bg-red-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-red-600 transition-colors shadow-md"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-green-600 transition-colors shadow-md"
            >
              Accept
            </button>
          </div>

          {/* Timer & Info */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className="ri-time-line text-orange-600 dark:text-orange-400"></i>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto decline in <span className="font-bold text-orange-600 dark:text-orange-400">2 min</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <i className="ri-shield-check-line text-green-500"></i>
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RidePopupPanel;