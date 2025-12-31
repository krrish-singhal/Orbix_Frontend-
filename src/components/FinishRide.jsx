"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import axios from "axios"
import toast from "react-hot-toast"
import gsap from "gsap"

const FinishRide = ({ ride, setFinishRidePanel }) => {
  const [showQR, setShowQR] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [additionalFees, setAdditionalFees] = useState({
    lateNightFee: 0,
    waitingFee: 0,
    damageFee: 0,
  })
  const [paymentMode, setPaymentMode] = useState("online")
  const navigate = useNavigate()
  
  const panelRef = useRef(null)
  const overlayRef = useRef(null)

  // Extract distance and duration from ride data (same as in CaptainHome)
  const rideDistance = ride?.distance || 0
  const rideDuration = ride?.duration || 0

  // GSAP Animation on mount
  useEffect(() => {
    if (panelRef.current && overlayRef.current) {
      // Set initial state
      gsap.set(panelRef.current, { y: "100%" })
      gsap.set(overlayRef.current, { opacity: 0 })
      
      // Animate in
      const tl = gsap.timeline()
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(panelRef.current, {
        y: 0,
        duration: 0.4,
        ease: "power3.out"
      }, "-=0.2")
    }
  }, [])

  // Close panel with animation
  const closePanel = () => {
    const tl = gsap.timeline({
      onComplete: () => setFinishRidePanel(false)
    })
    
    tl.to(panelRef.current, {
      y: "100%",
      duration: 0.3,
      ease: "power2.in"
    })
    .to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    }, "-=0.1")
  }

  const calculateTotalFare = () => {
    const baseFare = ride?.fare || 0
    const additionalTotal = Object.values(additionalFees).reduce((sum, fee) => sum + fee, 0)
    return baseFare + additionalTotal
  }

  const calculateCaptainEarnings = () => {
    const totalFare = calculateTotalFare()
    return Math.round(totalFare * 0.85)
  }

  const calculatePlatformFee = () => {
    const totalFare = calculateTotalFare()
    return Math.round(totalFare * 0.15)
  }

  const generateQRData = () => {
    const totalFare = calculateTotalFare()
    return JSON.stringify({
      rideId: ride._id,
      totalFare: totalFare,
      captainEarnings: calculateCaptainEarnings(),
      platformFee: calculatePlatformFee(),
      timestamp: Date.now(),
      type: "ride_payment",
    })
  }

  const handleFinishRide = async () => {
    try {
      const token = localStorage.getItem("token")
      const totalFare = calculateTotalFare()
      const captainEarnings = calculateCaptainEarnings()

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/finish`,
        {
          rideId: ride._id,
          totalFare: totalFare,
          captainEarnings: captainEarnings,
          platformFee: calculatePlatformFee(),
          additionalFees: additionalFees,
          paymentMode: paymentMode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.status === 200) {
        setPaymentSuccess(true)
        toast.success("Ride completed successfully!")
        setTimeout(() => {
          closePanel()
          setTimeout(() => navigate("/captain-home"), 400)
        }, 2000)
      }
    } catch (error) {
      console.error("Error finishing ride:", error)
      toast.error("Failed to finish ride. Please try again.")
    }
  }

  const handleFeeChange = (feeType, value) => {
    setAdditionalFees(prev => ({
      ...prev,
      [feeType]: parseFloat(value) || 0
    }))
  }

  return (
    <>
      {/* Semi-transparent overlay - doesn't block map completely */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={closePanel}
      />

      {/* Sliding Panel from Bottom */}
      <div 
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Finish Ride</h2>
          <button
            onClick={closePanel}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <i className="ri-close-line text-2xl text-gray-600"></i>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 pb-6">
          {paymentSuccess ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <i className="ri-check-line text-4xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ride Completed!</h3>
              <p className="text-gray-600">Redirecting to home...</p>
            </div>
          ) : (
            <>
              {/* Ride Details */}
              <div className="mt-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Ride Summary</h3>
                
                {/* Distance and Duration - Enhanced Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-100">
                  <div className="flex items-center justify-around">
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <i className="ri-map-pin-distance-line text-2xl text-blue-600"></i>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Distance</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {rideDistance ? `${rideDistance} km` : 'N/A'}
                      </div>
                    </div>
                    
                    <div className="w-px h-16 bg-blue-200"></div>
                    
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <i className="ri-time-line text-2xl text-indigo-600"></i>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Duration</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {rideDuration ? `${rideDuration} min` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup and Destination */}
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Pickup</p>
                      <p className="text-sm text-gray-900 font-medium">{ride?.pickup || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="ml-2 border-l-2 border-dashed border-gray-300 h-6"></div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Destination</p>
                      <p className="text-sm text-gray-900 font-medium">{ride?.destination || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Fees */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Additional Fees</h3>
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 font-medium">Late Night Fee</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        value={additionalFees.lateNightFee}
                        onChange={(e) => handleFeeChange('lateNightFee', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 font-medium">Waiting Fee</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        value={additionalFees.waitingFee}
                        onChange={(e) => handleFeeChange('waitingFee', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700 font-medium">Damage Fee</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        value={additionalFees.damageFee}
                        onChange={(e) => handleFeeChange('damageFee', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Payment Mode</h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMode === "online" 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                    <input
                      type="radio"
                      value="online"
                      checked={paymentMode === "online"}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="mr-3"
                    />
                    <i className="ri-smartphone-line text-xl mr-2"></i>
                    <span className="text-sm font-medium text-gray-700">Online Payment</span>
                  </label>
                  
                  <label className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMode === "cash" 
                      ? "border-green-500 bg-green-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMode === "cash"}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="mr-3"
                    />
                    <i className="ri-money-rupee-circle-line text-xl mr-2"></i>
                    <span className="text-sm font-medium text-gray-700">Cash Payment</span>
                  </label>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Fare Breakdown</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="text-gray-900 font-medium">₹{ride?.fare || 0}</span>
                  </div>
                  
                  {Object.entries(additionalFees).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="text-gray-900 font-medium">₹{value}</span>
                      </div>
                    )
                  ))}
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-base font-bold text-gray-900">Total Fare</span>
                      <span className="text-base font-bold text-gray-900">₹{calculateTotalFare()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Earnings (85%)</span>
                      <span className="text-green-600 font-semibold">₹{calculateCaptainEarnings()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Platform Fee (15%)</span>
                      <span className="text-gray-500">₹{calculatePlatformFee()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              {paymentMode === "online" && (
                <div className="mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">Payment QR</h3>
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        {showQR ? (
                          <>
                            <i className="ri-eye-off-line"></i>
                            Hide QR
                          </>
                        ) : (
                          <>
                            <i className="ri-qr-code-line"></i>
                            Show QR
                          </>
                        )}
                      </button>
                    </div>
                    
                    {showQR && (
                      <div className="flex justify-center bg-white rounded-lg p-4">
                        <QRCodeCanvas
                          value={generateQRData()}
                          size={200}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="H"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleFinishRide}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <i className="ri-check-double-line text-xl"></i>
                  Complete Ride - ₹{calculateTotalFare()}
                </button>
                
                <button
                  onClick={closePanel}
                  className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default FinishRide