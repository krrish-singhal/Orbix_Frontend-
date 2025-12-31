"use client"

import React, { useState, useEffect, useContext, useRef } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { io } from "socket.io-client"
import { CaptainDataContext } from "../context/CaptainContext"
import { SocketContext } from "../context/SocketContext"
import LiveMap from "../components/LiveMap"
import LocationPermission from "../components/LocationPermission"
import RidePopupPanel from "../components/RidePopupPanel"
import ThemeToggle from "../components/ThemeToggle"
import { getRoute, getVehicleImage } from "../../utils/mapUtils"
import gsap from "gsap"

const CaptainHome = () => {
  const navigate = useNavigate()
  const { captain, setCaptain } = useContext(CaptainDataContext)
  const { socket } = useContext(SocketContext)

  // States
  const [isOnline, setIsOnline] = useState(false)
  const [ride, setRide] = useState(null)
  const [currentRide, setCurrentRide] = useState(null)
  const [ongoingRide, setOngoingRide] = useState(null)
  const [ridePopupPanel, setRidePopupPanel] = useState(false)
  const [otpInput, setOtpInput] = useState("")
  const [rideOtp, setRideOtp] = useState("")

  const [captainLocation, setCaptainLocation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [showRoute, setShowRoute] = useState(false)
  const [eta, setEta] = useState(null)
  const [nearbyUsers, setNearbyUsers] = useState([])
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  // Enhanced stats states - only actual data, no fluctuations
  const [captainStats, setCaptainStats] = useState({
    todayEarnings: 0,
    tripsToday: 0,
    weeklyTrips: 0,
    weeklyEarnings: 0,
    rating: 4.5,
    totalTrips: 0,
    avgRideTime: 25,
    onlineHours: 0
  })

  // Helper function to safely get first letter of name
  const getInitial = (name) => {
    if (!name) return 'C';
    if (typeof name === 'string' && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    if (typeof name === 'object' && name.firstname) {
      return name.firstname.charAt(0).toUpperCase();
    }
    return 'C';
  };

  // Location Permissions Handlers
  const handleLocationGranted = (location) => {
    setCaptainLocation(location)
    setLocationPermissionGranted(true)
    toast.success("Location access granted! You can now go online.")
  }

  const handleLocationDenied = (error) => {
    toast.error("Location access is required to accept rides")
    setLocationPermissionGranted(false)
  }

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCaptainLocation(location)
          setLocationPermissionGranted(true)
          
          // Emit location to socket
          if (socket) {
            socket.emit("update-location-captain", {
              userId: captain._id,
              location: { ltd: location.lat, lng: location.lng },
            })
          }
        },
        (error) => {
          handleLocationDenied(error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    } else {
      toast.error("Geolocation is not supported by this browser")
    }
  }

  // Fetch captain profile and status
  const fetchCaptainProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captains/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setCaptain(response.data.captain)
      setIsOnline(response.data.captain?.status === 'active')
      
      // Fetch captain statistics
      fetchCaptainStats()
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/captain-login")
      }
    }
  }

  // Fetch captain statistics - actual data only
  const fetchCaptainStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captains/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      if (response.data && response.data.stats) {
        setCaptainStats(response.data.stats)
      }
    } catch (error) {
      // Keep current stats if API fails
    }
  }

  // Setup socket & fetch initial data
  useEffect(() => {
    if (captain) {
      fetchCaptainProfile()
      getCurrentLocation()
    }
  }, [captain])

  // Setup socket events
  useEffect(() => {
    if (!socket || !captain) return

    // Join socket room
    socket.emit("join", { userId: captain._id, userType: "captain" })

    const normalizeVehicleType = (type) => {
      if (!type) return "";
      const t = String(type).toLowerCase().trim();
      // handle arrays or comma lists
      if (Array.isArray(type)) return type.map(v => normalizeVehicleType(v));
      if (t.includes(",")) return t.split(",").map(s => normalizeVehicleType(s));

      // synonyms map
      if (/[cm]ar|sedan|hatch/.test(t)) return "car";
      if (/(moto|motor|motorcycle|scooter|bike|bicycle)/.test(t)) return "moto";
      if (/(auto|autorickshaw|rickshaw)/.test(t)) return "auto";
      return t;
    };

    const matchesVehicleType = (captainType, rideType) => {
      if (!captainType || !rideType) return true; // be permissive if missing

      // normalize both
      const cap = normalizeVehicleType(captainType);
      const ride = normalizeVehicleType(rideType);

      // If ride type is array
      if (Array.isArray(ride)) return ride.includes(cap);
      if (Array.isArray(cap)) return cap.includes(ride);

      // direct match or ride='any'
      return cap === ride || ride === "any";
    };

    const handleIncomingRideRequest = (data) => {
      if (!isOnline) return;

      const captainVehicleTypeRaw = captain?.vehicle?.vehicleType || "";
      const rideVehicleTypeRaw = data?.vehicleType || data?.vehicle || "";

      // Debug logs for troubleshooting
      console.log("[CAPTAIN] Ride request received:", data);
      console.log("[CAPTAIN] Captain vehicleType raw:", captainVehicleTypeRaw);
      console.log("[CAPTAIN] Ride vehicleType raw:", rideVehicleTypeRaw);

      if (matchesVehicleType(captainVehicleTypeRaw, rideVehicleTypeRaw)) {
        setRide(data);
        setRideOtp(data.otp || "");
        setRidePopupPanel(true);
        toast("New ride request received!");
      } else {
        console.log("[CAPTAIN] Ride vehicle type does not match captain's vehicle type. Ignoring ride request.");
      }
    };

    // Listen for both server event names: legacy and current
    socket.on("ride-request", handleIncomingRideRequest);
    socket.on("new-ride-request", handleIncomingRideRequest);

    socket.on("ride-taken", (data) => {
      if (ride && ride.rideId === data.rideId) {
        setRidePopupPanel(false)
        toast.info("Ride was taken by another captain")
      }
    })

    socket.on("ride-accepted", (data) => {
      console.log('=== CAPTAIN HOME RIDE-ACCEPTED DEBUG ===');
      console.log('Received data:', data);
      console.log('data.ride:', data.ride);
      console.log('data.ride?.otp:', data.ride?.otp);
      console.log('data.otp:', data.otp);
      console.log('=== END CAPTAIN HOME DEBUG ===');
      
      // Captain already navigated to /captain-confirm-ride
      // Just update the current ride state for reference
      setCurrentRide(data.ride)
      setRideOtp(data.otp || data.ride?.otp)
    })

    socket.on("ride-started", (data) => {
      toast.success("Ride started successfully!")
      // Captain is already navigated from CaptainConfirmRide page
      // Set ongoing ride for the green bar
      setCurrentRide(data.ride)
      setOngoingRide(data.ride)
    })

    socket.on("ride-start-success", (data) => {
      toast.success(data.message || "Ride started successfully!")
      // Captain is already on complete-ride page at this point
      setCurrentRide(null)
      setOtpInput("")
      setRideOtp("")
    })

    socket.on("invalid-otp", (data) => {
      toast.error(data.message || "Invalid OTP! Please try again.")
    })

    socket.on("ride-completed", (data) => {
      toast.success("Ride completed successfully!")
      
      // Clear ongoing ride
      setOngoingRide(null)
      
      // Refresh captain profile to get updated stats from backend
      fetchCaptainProfile()
    })

    socket.on("payment-success", (data) => {
      if (data.captainEarnings) {
        toast.success(`Payment received: ₹${data.captainEarnings}`)
        
        // Update earnings dynamically in real-time
        setCaptainStats(prev => ({
          ...prev,
          todayEarnings: (prev.todayEarnings || 0) + data.captainEarnings,
          tripsToday: (prev.tripsToday || 0) + 1,
          weeklyEarnings: (prev.weeklyEarnings || 0) + data.captainEarnings,
          weeklyTrips: (prev.weeklyTrips || 0) + 1,
          totalTrips: (prev.totalTrips || 0) + 1
        }))
      }
      
      // Clear ongoing ride after payment
      setOngoingRide(null)
      
      // Refresh captain profile to sync with backend
      fetchCaptainProfile()
    })

    socket.on("invalid-otp", (data) => {
      toast.error(data.message || "Invalid OTP!")
    })

    socket.on("error", (data) => {
      toast.error(data.message || "An error occurred")
    })

    return () => {
      socket.off("ride-request")
      socket.off("new-ride-request")
      socket.off("ride-accepted")
      socket.off("ride-started")
      socket.off("ride-completed")
      socket.off("payment-success")
      socket.off("ride-start-success")
      socket.off("invalid-otp")
      socket.off("error")
    }
  }, [socket, captain, isOnline, navigate])

  // Calculate route when locations change
  useEffect(() => {
    const calcRoute = async () => {
      if (!captainLocation || !userLocation) {
        setShowRoute(false)
        setRouteCoordinates([])
        setEta(null)
        return
      }
      
      try {
        const route = await getRoute(
          captainLocation.lat,
          captainLocation.lng,
          userLocation.lat,
          userLocation.lng
        )
        
        if (route) {
          setRouteCoordinates(route.coordinates)
          setEta(route.duration)
          setShowRoute(true)
        }
      } catch (error) {
        setShowRoute(false)
        setRouteCoordinates([])
        setEta(null)
      }
    }

    calcRoute()
  }, [captainLocation, userLocation])

  // Toggle online/offline status
  const toggleOnline = async () => {
    const newStatus = !isOnline
    
    try {
      const token = localStorage.getItem("token")
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/captains/status`,
        { status: newStatus ? "active" : "inactive" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setIsOnline(newStatus)
      
      if (newStatus && socket && captainLocation) {
        socket.emit("update-location-captain", {
          userId: captain._id,
          location: { ltd: captainLocation.lat, lng: captainLocation.lng },
        })
      }
      
      toast.success(`You are now ${newStatus ? "online" : "offline"}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  // Reset daily earnings (for testing/manual reset)
  const resetDailyEarnings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/reset-daily-earnings`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Update local state immediately
      setCaptainStats(prev => ({
        ...prev,
        todayEarnings: 0,
        tripsToday: 0,
        weeklyEarnings: 0,
        weeklyTrips: 0
      }))
      
      toast.success("All earnings reset to ₹0")
      
      // Refresh profile
      fetchCaptainProfile()
    } catch (error) {
      toast.error("Failed to reset earnings")
    }
  }

  // Ride handlers
  const confirmRide = () => {
    if (socket && ride) {
      socket.emit("accept-ride", {
        rideId: ride.rideId || ride._id,
        captainId: captain._id,
        captain: captain,
      })
      setRidePopupPanel(false)
      // Don't show ConfirmRidePopupPanel - navigate directly
      toast.success("Ride accepted! Navigate to pickup location.")
    }
  }

  // Navigate to tracking immediately after accept so captain sees route
  // and pickup info without waiting for backend round-trip.
  // Use the currently available `ride` object as initial data; backend
  // socket events can update state while on the tracking page.
  const confirmRideAndNavigate = () => {
    if (socket && ride) {
      socket.emit("accept-ride", {
        rideId: ride.rideId || ride._id,
        captainId: captain._id,
        captain: captain,
      })
      setRidePopupPanel(false)
      toast.success("Ride accepted! Navigating to OTP verification...")
      
      try {
        // After accepting, redirect captain to the OTP entry screen so they
        // can verify passenger OTP to start the ride.
        navigate('/captain-confirm-ride', {
          state: {
            rideData: ride,
            captainDetails: captain,
            otp: ride?.otp || ''
          }
        })
      } catch (e) {
        console.error('Navigation after accept failed', e)
      }
    }
  }

  const declineRide = () => {
    if (socket && ride) {
      socket.emit("decline-ride", {
        rideId: ride.rideId || ride._id,
        captainId: captain._id,
      })
    }
    setRidePopupPanel(false)
    setRide(null)
    toast("Ride declined")
  }

  const handleStartRide = () => {
    if (socket && currentRide && otpInput.trim() === rideOtp.trim()) {
      socket.emit("start-ride", { 
        rideId: currentRide.rideId || currentRide._id, 
        otp: otpInput,
        captainId: captain._id 
      })
    } else {
      toast.error("Invalid OTP!")
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("captain")
    setCaptain(null)
    if (socket) {
      socket.disconnect()
    }
    navigate("/captain-login")
  }

  // Show location permission component if not granted
  if (!locationPermissionGranted) {
    return (
      <LocationPermission
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    )
  }

  if (!captain) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[1920px] h-full flex flex-col relative">
      {/* Ongoing Ride Bar - Green bar at top */}
      {ongoingRide && (
        <div 
          onClick={() => navigate('/captain-ride-tracking')}
          className="bg-green-500 hover:bg-green-600 cursor-pointer transition-colors p-3 flex items-center justify-between shadow-lg z-40"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="text-white">
              <p className="font-semibold text-sm">Ride in Progress</p>
              <p className="text-xs opacity-90">Tap to view ride details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium">₹{ongoingRide.fare}</span>
            <i className="ri-arrow-right-line text-white text-lg"></i>
          </div>
        </div>
      )}
      
      {/* Enhanced Navbar */}
      <div className="bg-white shadow-lg border-b border-gray-200 z-30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <i className="ri-steering-2-fill text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Captain Portal
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Online/Offline Toggle */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={toggleOnline}
                disabled={!locationPermissionGranted}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isOnline ? 'bg-green-500' : 'bg-gray-300'
                } ${!locationPermissionGranted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isOnline ? 'translate-x-7' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle className="mr-2" />
            
            {/* Captain Avatar */}
            <button
              onClick={() => navigate('/captain-profile')}
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              title="View Profile"
            >
              {captain?.profileImage ? (
                <img
                  src={captain.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {getInitial(captain?.fullname)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Map Section - Enhanced with better visibility */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <LiveMap
          userLocation={userLocation}
          captainLocation={captainLocation}
          pickupLocation={currentRide?.pickupCoords || ride?.pickupCoords}
          destinationLocation={currentRide?.destinationCoords || ride?.destinationCoords}
          routeCoordinates={routeCoordinates}
          showRoute={showRoute}
          markerType="captain"
          className="w-full h-full min-h-[400px]"
        />
        
        {/* Map overlay for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        
        {/* Location indicator overlay - Enhanced */}
        {captainLocation && (
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
              <div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">Location Active</span>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lat: {captainLocation.lat?.toFixed(4)}, Lng: {captainLocation.lng?.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-4 right-4 space-y-3">
          <button
            onClick={() => navigate('/captain-wallet')}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <i className="ri-wallet-line text-lg"></i>
          </button>
          <button
            onClick={() => navigate('/captain-rides')}
            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <i className="ri-history-line text-lg"></i>
          </button>
        </div>
      </div>

      {/* Dashboard Section - Fixed height bottom section */}
      <div className="bg-white border-t border-gray-200 p-4 max-h-96 overflow-y-auto">
        {/* Status Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Status Card */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <i className={`ri-user-location-line text-white text-sm`}></i>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className={`text-sm font-bold ${
                  isOnline ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Today's Earnings Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-white text-sm"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Today's Earnings</p>
                  <p className="text-sm font-bold text-blue-600">₹{captainStats.todayEarnings}</p>
                </div>
              </div>
              <button
                onClick={resetDailyEarnings}
                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                title="Reset earnings"
              >
                <i className="ri-restart-line text-red-600 text-sm"></i>
              </button>
            </div>
          </div>

          {/* Trips Completed Card */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <i className="ri-map-pin-line text-white text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-gray-600">Trips Today</p>
                <p className="text-sm font-bold text-purple-600">{captainStats.tripsToday}</p>
              </div>
            </div>
          </div>

          {/* Rating Card */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <i className="ri-star-fill text-white text-sm"></i>
              </div>
              <div>
                <p className="text-xs text-gray-600">Rating</p>
                <p className="text-sm font-bold text-yellow-600">{captainStats.rating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Weekly Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{captainStats.weeklyTrips}</p>
              <p className="text-xs text-gray-600">Weekly Trips</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">₹{captainStats.weeklyEarnings}</p>
              <p className="text-xs text-gray-600">Weekly Earnings</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{captainStats.avgRideTime}m</p>
              <p className="text-xs text-gray-600">Avg Ride Time</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">{captainStats.onlineHours}h</p>
              <p className="text-xs text-gray-600">Online Hours</p>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Vehicle Type</p>
              <p className="text-sm font-semibold capitalize">{captain?.vehicle?.vehicleType || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">License Plate</p>
              <p className="text-sm font-semibold">{captain?.vehicle?.plate || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Color</p>
              <p className="text-sm font-semibold capitalize">{captain?.vehicle?.color || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Capacity</p>
              <p className="text-sm font-semibold">{captain?.vehicle?.capacity || 0} passengers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-white shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Captain Menu</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              {/* Captain Info */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {getInitial(captain?.fullname)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {captain?.fullname?.firstname || 'Captain'} {captain?.fullname?.lastname || ''}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {captain?.vehicle?.plate || 'Vehicle not registered'}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <i className="ri-star-fill text-yellow-400 text-xs"></i>
                      <span className="text-xs text-gray-600">{captainStats.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex flex-col h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex flex-col gap-2">
                <SidebarItem 
                  icon="ri-dashboard-line" 
                  text="Dashboard" 
                  onClick={() => {
                    setShowSidebar(false)
                  }}
                />
                <SidebarItem 
                  icon="ri-car-line" 
                  text="My Vehicle" 
                  onClick={() => {
                    setShowSidebar(false)
                    navigate("/captain-vehicle")
                  }}
                />
                <SidebarItem 
                  icon="ri-history-line" 
                  text="Ride History" 
                  onClick={() => {
                    setShowSidebar(false)
                    navigate("/captain-rides")
                  }}
                />
                <SidebarItem 
                  icon="ri-wallet-line" 
                  text="Orbix Wallet" 
                  onClick={() => {
                    setShowSidebar(false)
                    navigate("/captain-wallet")
                  }}
                />
                <SidebarItem 
                  icon="ri-user-line" 
                  text="Profile" 
                  onClick={() => {
                    setShowSidebar(false)
                    navigate("/captain-profile")
                  }}
                />
                <SidebarItem 
                  icon="ri-settings-line" 
                  text="Settings" 
                  onClick={() => {
                    setShowSidebar(false)
                    navigate("/captain-settings")
                  }}
                />
                <SidebarItem 
                  icon="ri-question-line" 
                  text="Help & Support" 
                  onClick={() => {
                    setShowSidebar(false)
                    navigate("/captain-help")
                  }}
                />
                <div className="mb-20">
                  <SidebarItem 
                    icon="ri-logout-box-line" 
                    text="Logout" 
                    onClick={logout}
                    className="text-red-600 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
          <div 
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setShowSidebar(false)}
          ></div>
        </div>
      )}

      {/* Ride Request Panel - Only show this, navigate to OTP screen after accept */}
      {ridePopupPanel && (
        <RidePopupPanel
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          confirmRide={confirmRideAndNavigate}
          declineRide={declineRide}
        />
      )}
      </div>
    </div>
  )
}

// Sidebar Item Component
const SidebarItem = ({ icon, text, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${className}`}
  >
    <i className={`${icon} text-xl`}></i>
    <span className="font-medium">{text}</span>
  </button>
)

export default CaptainHome