"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { SocketContext } from "../context/SocketContext";
import OtpInput from "./OtpInput";

const ConfirmRidePopUp = ({ ride, setConfirmRidePopupPanel, captain, rideOtp }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    const handleRideStartSuccess = (data) => {
      setLoading(false);
      toast.success(data.message || "Ride started successfully!");
      setConfirmRidePopupPanel(false);
      navigate("/complete-ride", { 
        state: { 
          rideData: ride,
          captainDetails: captain,
          isUser: false
        }
      });
    };

    const handleInvalidOtp = (data) => {
      setLoading(false);
      setError(data.message || "Invalid OTP! Please try again.");
      toast.error(data.message || "Invalid OTP!");
    };

    socket.on("ride-start-success", handleRideStartSuccess);
    socket.on("invalid-otp", handleInvalidOtp);

    return () => {
      socket.off("ride-start-success", handleRideStartSuccess);
      socket.off("invalid-otp", handleInvalidOtp);
    };
  }, [socket, navigate, setConfirmRidePopupPanel, ride, captain]);

  const handleOtpComplete = (enteredOtp) => {
    // Ensure OTP is clean and properly formatted
    const cleanOtp = enteredOtp.toString().trim();
    setOtp(cleanOtp);
    setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Ensure OTP is properly formatted
    const cleanOtp = otp.trim();
    
    if (cleanOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    
    // Validate that OTP contains only digits
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("OTP must contain only numbers");
      return;
    }
    
    setLoading(true);
    setError(""); // Clear any previous errors
    
    try {
      if (socket && ride && captain) {
        console.log('=== FRONTEND OTP DEBUG ===');
        console.log('User entered OTP:', cleanOtp);
        console.log('Expected OTP from rideOtp prop:', rideOtp);
        console.log('Expected OTP from ride.otp:', ride?.otp);
        console.log('OTP type:', typeof cleanOtp);
        console.log('OTP length:', cleanOtp.length);
        console.log('Ride ID:', ride._id || ride.rideId);
        console.log('Captain ID:', captain._id);
        console.log('=== END FRONTEND DEBUG ===');
        
        socket.emit("start-ride", { 
          rideId: ride._id || ride.rideId, 
          otp: cleanOtp,
          captainId: captain._id 
        });
        
        toast.success("Starting ride...");
      } else {
        setError("Connection lost or missing information. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error starting ride:", error);
      setError("Failed to start ride. Please try again.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmRidePopupPanel(false);
  };

  if (!ride || !captain) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Ride Start</h3>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ride Details */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pickup</p>
                  <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{ride.pickup}</p>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-600 ml-1.5 h-4"></div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
                  <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{ride.destination}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Fare</span>
                <span className="text-xl font-bold text-green-600">{ride.fare}</span>
              </div>
            </div>
          </div>

          {/* OTP Input Section */}
          <form onSubmit={submitHandler} className="space-y-4">
            <div className="text-center">
              <h5 className="font-semibold text-gray-800 dark:text-white mb-2">Enter Passenger OTP</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">The passenger will provide you with a 6-digit code</p>
            </div>
            <div className="flex justify-center">
              <OtpInput length={6} onComplete={handleOtpComplete} error={!!error} />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                <i className="ri-error-warning-line mr-1"></i>
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleCancel} className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading || otp.length !== 6} className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Starting...
                  </div>
                ) : (
                  <>
                    <i className="ri-play-circle-line mr-2"></i>
                    Start Ride
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRidePopUp;
