"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import QRCode from "qrcode.react"
import axios from "axios"
import toast from "react-hot-toast"
import { SocketContext } from "../context/SocketContext"
import LiveMap from "../components/LiveMap"
import { geocodeAddress, getRoute } from "../utils/mapUtils"

const CaptainCompleteRide = () => {
  const [rideData, setRideData] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [captainLocation, setCaptainLocation] = useState(null)
  const [pickupCoords, setPickupCoords] = useState(null)
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [showRoute, setShowRoute] = useState(true)
  const [eta, setEta] = useState(null)
  const [formData, setFormData] = useState({
    pickupAddress: "",
    destinationAddress: "",
    transportMode: "",
    lateNightFee: 0,
    waitingFee: 0,
    damageFee: 0,
    paymentMode: "online",
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { socket } = useContext(SocketContext)

  useEffect(() => {
    if (location.state?.rideData) {
      setRideData(location.state.rideData)
      setFormData((prev) => ({
        ...prev,
        pickupAddress: location.state.rideData.pickup,
        destinationAddress: location.state.rideData.destination,
        transportMode: location.state.rideData.vehicleType,
      }))
      fetchLocationCoordinates(location.state.rideData)
    }

    // Get captain location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCaptainLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      })
    }
  }, [location.state])

  useEffect(() => {
    if (socket && rideData) {
      // Listen for user location updates
      socket.on("update-location-user", (data) => {
        if (data.userId === rideData.user?._id) {
          setUserLocation({ lat: data.location.ltd, lng: data.location.lng })
        }
      })

      // Listen for payment updates
      socket.on("payment-completed", (data) => {
        if (data.rideId === rideData._id) {
          setPaymentSuccess(true)
          toast.success("Payment received successfully!")
        }
      })

      return () => {
        socket.off("update-location-user")
        socket.off("payment-completed")
      }
    }
  }, [socket, rideData])

  const fetchLocationCoordinates = async (ride) => {
    try {
      const [pickupResult, destinationResult] = await Promise.all([
        geocodeAddress(ride.pickup),
        geocodeAddress(ride.destination)
      ])

      if (pickupResult && destinationResult) {
        setPickupCoords(pickupResult)
        setDestinationCoords(destinationResult)
        
        // Get route between pickup and destination
        const route = await getRoute(pickupResult, destinationResult)
        if (route) {
          setRouteCoordinates(route.coordinates)
          setEta(route.duration)
        }
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error)
    }
  }

  const handleCompleteRide = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Calculate total fare
      const baseFare = rideData.fare || 0
      const additionalFees = formData.lateNightFee + formData.waitingFee + formData.damageFee
      const totalFare = baseFare + additionalFees

      const completeData = {
        rideId: rideData._id,
        totalFare,
        additionalFees: {
          lateNightFee: formData.lateNightFee,
          waitingFee: formData.waitingFee,
          damageFee: formData.damageFee
        },
        paymentMode: formData.paymentMode,
        endLocation: captainLocation
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/complete-ride`,
        completeData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.success) {
        if (formData.paymentMode === "online") {
          setShowQR(true)
        } else {
          // Cash payment - complete immediately
          toast.success("Ride completed successfully!")
          navigate("/captain-home", { 
            state: { 
              rideCompleted: true,
              earnings: totalFare
            }
          })
        }
      }
    } catch (error) {
      console.error("Error completing ride:", error)
      toast.error("Error completing ride. Please try again.")
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleCompleteRide()
  }

  const generateQRData = () => {
    const totalFare = (rideData.fare || 0) + formData.lateNightFee + formData.waitingFee + formData.damageFee
    return JSON.stringify({
      rideId: rideData._id,
      amount: totalFare,
      captainId: rideData.captain,
      timestamp: Date.now()
    })
  }

  if (!rideData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ride details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Ride</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Finalize payment and end trip</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Trip ID</div>
            <div className="text-sm font-mono text-gray-900 dark:text-white">#{rideData._id?.slice(-6)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Map Section */}
        <div className="flex-1 relative">
          <LiveMap
            userLocation={userLocation}
            captainLocation={captainLocation}
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            routeCoordinates={showRoute ? routeCoordinates : []}
            showRoute={showRoute}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`p-2 rounded text-sm font-medium transition-colors ${
                showRoute
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showRoute ? 'Hide Route' : 'Show Route'}
            </button>
          </div>

          {/* ETA Display */}
          {eta && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(eta)} min</div>
            </div>
          )}
        </div>

        {/* Ride Details & Payment Section */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
          {paymentSuccess ? (
            // Payment Success View
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Payment Received!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">The ride has been completed successfully.</p>
              <button
                onClick={() => navigate("/captain-home", { 
                  state: { 
                    rideCompleted: true,
                    earnings: (rideData.fare || 0) + formData.lateNightFee + formData.waitingFee + formData.damageFee
                  }
                })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Return to Home
              </button>
            </div>
          ) : showQR ? (
            // QR Code View
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment QR Code</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Show this QR code to the passenger for payment</p>
              
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 mb-6">
                <QRCode
                  value={generateQRData()}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{((rideData.fare || 0) + formData.lateNightFee + formData.waitingFee + formData.damageFee).toFixed(2)}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentSuccess(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Confirm Payment Received
                </button>
                <button
                  onClick={() => setShowQR(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Back to Details
                </button>
              </div>
            </div>
          ) : (
            // Ride Completion Form
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Ride Summary</h2>

              {/* Passenger Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {(rideData.user?.fullname?.firstname?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {rideData.user?.fullname?.firstname 
                        ? `${rideData.user.fullname.firstname} ${rideData.user.fullname.lastname || ''}`.trim()
                        : 'Passenger'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {rideData.user?.phone || 'Phone not available'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Pickup
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {rideData.pickup}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Destination
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {rideData.destination}
                  </div>
                </div>
              </div>

              {/* Completion Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMode: 'online' }))}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.paymentMode === 'online'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMode: 'cash' }))}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.paymentMode === 'cash'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Cash
                    </button>
                  </div>
                </div>

                {/* Additional Fees */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Additional Charges (if any)</h3>
                  
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Late Night Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.lateNightFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, lateNightFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Waiting Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.waitingFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, waitingFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Damage Fee (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.damageFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, damageFee: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Total Calculation */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Base Fare:</span>
                      <span className="text-gray-900 dark:text-white">₹{(rideData.fare || 0).toFixed(2)}</span>
                    </div>
                    {formData.lateNightFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Late Night Fee:</span>
                        <span className="text-gray-900 dark:text-white">₹{formData.lateNightFee.toFixed(2)}</span>
                      </div>
                    )}
                    {formData.waitingFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Waiting Fee:</span>
                        <span className="text-gray-900 dark:text-white">₹{formData.waitingFee.toFixed(2)}</span>
                      </div>
                    )}
                    {formData.damageFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Damage Fee:</span>
                        <span className="text-gray-900 dark:text-white">₹{formData.damageFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-gray-900 dark:text-white">
                          ₹{((rideData.fare || 0) + formData.lateNightFee + formData.waitingFee + formData.damageFee).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Complete Ride
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaptainCompleteRide