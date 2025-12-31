"use client";
import React, { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import BackButton from "../components/BackButton";
import axios from "axios";
import toast from "react-hot-toast";
import { getVehicleImage } from "../../utils/mapUtils";

function LookingForDriver() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user, walletBalance } = useContext(UserDataContext);
  const [rideData, setRideData] = useState(location.state?.rideData || null);
  const [rideOtp, setRideOtp] = useState("");
  const [foundDriver, setFoundDriver] = useState(null);
  const [rideCreated, setRideCreated] = useState(false); // Track if ride was already created
  const [walletLinked, setWalletLinked] = useState(false);
  // walletBalance is now from context
  
  // Check if wallet has sufficient balance (fare + minimum 100 rupees)
  const hassufficientBalance = walletBalance >= (rideData?.fare || 0) + 100;

  useEffect(() => {
    if (!rideData) {
      toast.error("No ride data found");
      navigate("/home");
      return;
    }

    // Prevent multiple ride creations
    if (rideCreated) {
      console.log("⚠️ Ride already created, skipping...");
      return;
    }

    // Create ride request
    const createRideRequest = async () => {
      try {
        setRideCreated(true); // Mark as created BEFORE making the request
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/rides/create`,
          {
            ...rideData,
            walletLinked,
            paymentMethod: walletLinked ? 'wallet' : (rideData.paymentMethod || 'cash')
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        console.log("✅ Ride created successfully:", response.data.ride._id);
        setRideOtp(response.data.ride.otp);

        // Emit ride request to captains via socket
        if (socket && user) {
          console.log("🚗 Emitting new-ride-request with OTP:", response.data.ride.otp);
          
          socket.emit("new-ride-request", {
            rideId: response.data.ride._id,
            user: {
              _id: user._id,
              fullname: typeof user.fullname === 'object' && user.fullname !== null
                ? `${user.fullname.firstname || ''} ${user.fullname.lastname || ''}`.trim()
                : user.fullname || '',
              phone: user.phone
            },
            pickup: rideData.pickup,
            destination: rideData.destination,
            fare: rideData.fare,
            vehicleType: rideData.vehicleType,
            distance: rideData.distance,
            duration: rideData.duration,
            otp: response.data.ride.otp,
            paymentMethod: walletLinked ? 'wallet' : (rideData.paymentMethod || 'cash'),
            walletLinked
          });
        }
      } catch (error) {
        console.error("❌ Failed to create ride:", error);
        setRideCreated(false); // Reset on error
        toast.error("Failed to create ride request");
        navigate("/home");
      }
    };

    createRideRequest();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    if (socket) {
      console.log("👂 Setting up socket listeners for ride updates")
      console.log("Socket connected:", socket.connected);
      console.log("Socket ID:", socket.id);
      
      // Ensure we're in the right room
      if (user?._id) {
        socket.emit("join", { userId: user._id, userType: "user" });
        console.log("✅ Joined socket room as user:", user._id);
      }
      
      socket.on("ride-accepted", (data) => {
        console.log("✅ Ride accepted, driver found:", data);
        console.log("✅ Captain data:", data.captain);
        console.log("✅ Captain fullname:", data.captain?.fullname);
        setFoundDriver(data.captain);
        // Update ride data with OTP from backend
        setRideData(prevRide => ({
          ...prevRide,
          otp: data.otp,
          captain: data.captain
        }));
        toast.success("Driver found! Waiting for ride to start...");
        // Stay on this page - don't navigate to home
        // User will be redirected when ride-started event fires
      });

      socket.on("ride-started", (data) => {
        console.log("🚀 LOOKING_FOR_DRIVER: Ride started event received!");
        console.log("🚀 LOOKING_FOR_DRIVER: Data:", data);
        console.log("🚀 LOOKING_FOR_DRIVER: Ride data:", data.ride);
        
        toast.success("Your ride has started!", {
          style: {
            background: '#22c55e',
            color: '#ffffff',
            fontWeight: '600',
            borderRadius: '8px',
            padding: '12px 16px'
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#22c55e',
          },
          duration: 2000
        });
        
        console.log("🚀 LOOKING_FOR_DRIVER: Navigating to /user-ride-view");
        navigate("/user-ride-view", {
          state: {
            rideData: data.ride,
          },
          replace: true
        });
      });

      socket.on("no-captains-available", () => {
        console.log("❌ No captains available")
        toast.error("No drivers available at the moment. Please try again.");
        setTimeout(() => navigate("/home"), 2000);
      });

      socket.on("error", (data) => {
        console.error("❌ Socket error:", data)
        toast.error(data.message || "Something went wrong");
      });

      return () => {
        console.log("🧹 Cleaning up socket listeners")
        socket.off("ride-accepted");
        socket.off("ride-started");
        socket.off("no-captains-available");
        socket.off("error");
      };
    }
  }, [socket, navigate]);

  const cancelRide = () => {
    if (socket) {
      socket.emit("cancel-ride", { userId: user._id });
    }
    navigate("/home");
  };

  if (!rideData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative bg-gray-100 dark:bg-gray-900">
      {/* Map background */}
      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-map-2-line text-blue-600 dark:text-blue-400 text-2xl"></i>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Map loading...</p>
        </div>
      </div>

      {/* Looking for driver panel */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <button
            onClick={cancelRide}
            className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          ></button>
        </div>

        <div className="px-4 sm:px-6 pb-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <BackButton />
              <div className="flex-1"></div>
            </div>
            <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
              {foundDriver ? "Driver Found!" : "Looking for a Driver"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {foundDriver ? "Your driver is on the way" : "We're finding the best driver for you"}
            </p>
            </div>
          </div>

          {/* Driver Details */}
          {foundDriver && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-white font-bold text-xl sm:text-2xl">
                    {(() => {
                      if (typeof foundDriver.fullname === 'object' && foundDriver.fullname !== null) {
                        return (foundDriver.fullname.firstname?.[0] || 'C').toUpperCase();
                      } else if (typeof foundDriver.fullname === 'string') {
                        return foundDriver.fullname[0]?.toUpperCase() || 'C';
                      } else {
                        return 'C';
                      }
                    })()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {(() => {
                      if (typeof foundDriver.fullname === 'object' && foundDriver.fullname !== null) {
                        return `${foundDriver.fullname.firstname || ''} ${foundDriver.fullname.lastname || ''}`.trim() || 'Captain';
                      } else if (typeof foundDriver.fullname === 'string') {
                        return foundDriver.fullname;
                      } else {
                        return 'Captain';
                      }
                    })()}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {foundDriver.vehicle?.plate}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center text-yellow-500 mr-3">
                      <i className="ri-star-fill text-sm mr-1"></i>
                      <span className="text-xs sm:text-sm font-medium">4.8</span>
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                      ETA: 3 mins
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTP Display */}
          {rideOtp && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 border-2 border-blue-200 dark:border-blue-700 flex flex-col items-center">
              {/* Captain Name Centered and Moved Up */}
              <div className="flex flex-col items-center mb-2">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg sm:text-xl mb-1">
                  {(() => {
                    if (foundDriver && typeof foundDriver.fullname === 'object' && foundDriver.fullname !== null) {
                      return `${foundDriver.fullname.firstname || ''} ${foundDriver.fullname.lastname || ''}`.trim() || 'Captain';
                    } else if (foundDriver && typeof foundDriver.fullname === 'string') {
                      return foundDriver.fullname;
                    } else {
                      return 'Captain';
                    }
                  })()}
                </span>
                <span className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm font-medium mb-1">
                  {foundDriver?.vehicle?.plate || ''}
                </span>
              </div>
              <div className="text-center w-full">
                <div className="flex items-center justify-center mb-2">
                  <i className="ri-key-2-line text-blue-600 dark:text-blue-400 text-xl mr-2"></i>
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    Your Ride OTP
                  </h4>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-600 mb-2 flex justify-center">
                  <div className="flex justify-center space-x-2 sm:space-x-3">
                    {rideOtp.split('').map((digit, index) => (
                      <div
                        key={index}
                        className="w-10 h-12 sm:w-12 sm:h-14 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-lg flex items-center justify-center shadow-md"
                      >
                        <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                          {digit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Share this OTP with your driver to start the ride
                </p>
              </div>
            </div>
          )}

          {/* Vehicle Image */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-4 flex items-center justify-center">
              <img
                src={getVehicleImage(rideData?.vehicleType)}
                alt={rideData?.vehicleType}
                className="object-contain border-4 border-blue-500 rounded-full"
                style={{ width: '80px', height: '80px' }}
              />
            </div>
          </div>

          {/* Wallet Link Option */}
          <div className="mb-4">
            <div className={`p-4 rounded-xl border-2 transition-all ${
              walletLinked 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600' 
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                    walletLinked ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-400 dark:bg-gray-500'
                  }`}>
                    <i className="ri-wallet-3-line text-white text-lg sm:text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Link Orbix Wallet
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Balance: ₹{walletBalance}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => hassufficientBalance && setWalletLinked(!walletLinked)}
                  disabled={!hassufficientBalance}
                  className={`relative w-14 h-7 sm:w-16 sm:h-8 rounded-full transition-all flex-shrink-0 ${
                    walletLinked ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  } ${!hassufficientBalance ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow transition-transform ${
                    walletLinked ? 'transform translate-x-7 sm:translate-x-8' : ''
                  }`}></div>
                </button>
              </div>
              
              {!hassufficientBalance && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg mt-3">
                  <i className="ri-error-warning-line text-red-500 text-lg mt-0.5 flex-shrink-0"></i>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 font-medium">
                      Insufficient Balance
                    </p>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-500 mt-0.5">
                      Need ₹{(rideData?.fare || 0) + 100} (Fare: ₹{rideData?.fare || 0} + ₹100 min)
                    </p>
                    <button 
                      onClick={() => navigate('/orbix-wallet')}
                      className="mt-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Add Money →
                    </button>
                  </div>
                </div>
              )}
              
              {walletLinked && (
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg mt-3">
                  <i className="ri-checkbox-circle-line text-green-500 text-lg mt-0.5 flex-shrink-0"></i>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium">
                      Wallet Linked Successfully
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-500 mt-0.5">
                      ₹{rideData?.fare || 0} will be auto-deducted after ride completion
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-map-pin-user-fill text-green-600 dark:text-green-400 text-lg"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pickup</h3>
                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium line-clamp-1">
                  {rideData.pickup}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-map-pin-2-fill text-red-600 dark:text-red-400 text-lg"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Destination</h3>
                <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium line-clamp-1">
                  {rideData.destination}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-currency-line text-green-600 dark:text-green-400 text-lg"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fare</h3>
                <p className="text-base sm:text-lg text-gray-900 dark:text-white font-bold">₹{rideData.fare}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {walletLinked ? 'Orbix Wallet' : 'Cash Payment'}
                </p>
              </div>
            </div>
          </div>

          {/* Loading Animation for Finding Driver */}
          {!foundDriver && (
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-green-200 dark:border-green-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-14 h-14 sm:w-16 sm:h-16 border-4 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="ml-2 text-xs sm:text-sm font-medium">Searching for drivers...</span>
              </div>
            </div>
          )}

          {/* Cancel button */}
          <button
            onClick={cancelRide}
            className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Cancel Ride
          </button>
        </div>
      </div>
    </div>
  );
}

export default LookingForDriver;
