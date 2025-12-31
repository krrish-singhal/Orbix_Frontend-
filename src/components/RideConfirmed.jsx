import React, { useState, useEffect } from 'react'

const RideConfirmed = ({ ride, onClose }) => {
  const [estimatedTime, setEstimatedTime] = useState(null)
  const [currentRide, setCurrentRide] = useState(ride)

  useEffect(() => {
    // If ride changes (e.g., after acceptance), update currentRide
    setCurrentRide(ride)
  }, [ride])

  useEffect(() => {
    // Calculate realistic estimated arrival time
    const calculateArrivalTime = () => {
      const baseTime = 5 // Base time in minutes
      const randomVariation = Math.floor(Math.random() * 10) // 0-10 minutes variation
      const totalMinutes = baseTime + randomVariation
      
      const now = new Date()
      const arrivalTime = new Date(now.getTime() + totalMinutes * 60000)
      
      setEstimatedTime({
        minutes: totalMinutes,
        arrivalTime: arrivalTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      })
    }

    calculateArrivalTime()
  }, [])

  const captain = {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    rating: 4.8,
    vehicleNumber: 'DL 8C AB 1234',
    vehicleModel: 'Maruti Swift',
    photo: 'https://via.placeholder.com/60x60'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-2xl text-green-600"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">Ride Confirmed!</h2>
          <p className="text-gray-600">Your payment was successful</p>
        </div>

        {/* Ride Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Ride ID</span>
            <span className="text-sm font-medium">{ride?.id || '#ORB123456'}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm font-medium">{ride?.pickup || 'Pickup location'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-3"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm font-medium">{ride?.destination || 'Destination'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Captain Details */}
        <div className="border rounded-xl p-4 mb-6">
          <h3 className="font-medium mb-3">Your Captain</h3>
          <div className="flex items-center">
            <img 
              src={captain.photo} 
              alt={captain.name}
              className="w-12 h-12 rounded-full mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <h4 className="font-medium mr-2">{captain.name}</h4>
                <div className="flex items-center text-xs">
                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                  <span>{captain.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{captain.vehicleModel}</p>
              <p className="text-sm font-medium">{captain.vehicleNumber}</p>
            </div>
            <a 
              href={`tel:${captain.phone}`}
              className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
            >
              <i className="ri-phone-line text-green-600"></i>
            </a>
          </div>
        </div>

        {/* Estimated Arrival */}
        {estimatedTime && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Estimated Arrival</h4>
                <p className="text-sm text-blue-700">Captain will arrive in {estimatedTime.minutes} mins</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-900">{estimatedTime.arrivalTime}</p>
                <p className="text-xs text-blue-600">Expected time</p>
              </div>
            </div>
          </div>
        )}

        {/* OTP */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-6 border border-yellow-200 dark:border-yellow-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shield-check-line text-white text-2xl"></i>
            </div>
            <h4 className="font-bold text-lg text-yellow-900 dark:text-yellow-100 mb-2">Your Ride OTP</h4>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border-2 border-yellow-300 dark:border-yellow-600">
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 tracking-widest">
                {currentRide?.otp || '------'}
              </p>
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Share this OTP with your captain to start the ride
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
          >
            Close
          </button>
          <button className="flex-1 bg-black text-white py-3 rounded-xl font-medium">
            Track Ride
          </button>
        </div>
      </div>
    </div>
  )
}

export default RideConfirmed
