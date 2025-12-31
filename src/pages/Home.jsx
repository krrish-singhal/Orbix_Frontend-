"use client";
import React, { useRef, useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import axios from "axios";
import "remixicon/fonts/remixicon.css";
import toast from "react-hot-toast";
import logo from "../assets/image.png";

import "../assets/orbixAnimations.css";

import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRidePanel from "../components/ConfirmRidePanel";
import WaitingForDriver from "../components/WaitingForDriver";
import Wallet from "../components/Wallet";
import Sidebar from "../components/Sidebar";
import LiveMap from "../components/LiveMap";
import LocationPermission from "../components/LocationPermission";
import ThemeToggle from "../components/ThemeToggle";
import RidePaymentModal from "../components/RidePaymentModal";
import { geocodeAddress, getRoute } from "../../utils/mapUtils";
import { UserDataContext } from "../context/UserContext";
import { SocketContext } from "../context/SocketContext";

// Vehicle name → fare key map
const vehicleTypeMap = {
  UberGo: "car",
  Moto: "moto",
  UberMoto: "moto",
  UberAuto: "auto",
  Auto: "auto"
};

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [showVehiclePanel, setShowVehiclePanel] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [showWaitingForDriver, setShowWaitingForDriver] = useState(false);
  const [inputAtTop, setInputAtTop] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [fare, setFare] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showWallet, setShowWallet] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [ongoingRide, setOngoingRide] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedRide, setCompletedRide] = useState(null);
  const [rideOtp, setRideOtp] = useState("");
  const [rideStatus, setRideStatus] = useState(""); // waiting, accepted, ongoing, completed
  const [userLocation, setUserLocation] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [eta, setEta] = useState(null);
  const [nearbyCaptains, setNearbyCaptains] = useState([]);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [showRoute, setShowRoute] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [trafficLightState, setTrafficLightState] = useState('red'); // red, yellow, green

  const inputPanelRef = useRef(null);
  const locationSearchPanelContainerRef = useRef(null);
  const overlayRef = useRef(null);
  const debounceTimeout = useRef(null);

  const navigate = useNavigate();
  const { user, walletBalance, setWalletBalance } = useContext(UserDataContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    
    // Load ongoing ride from localStorage and validate it
    const savedOngoingRide = localStorage.getItem('ongoingRide');
    if (savedOngoingRide) {
      try {
        const rideData = JSON.parse(savedOngoingRide);
        console.log('Loaded ongoing ride from localStorage:', rideData);
        
        // Validate if ride is still ongoing by checking with backend
        const validateRide = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/${rideData._id}`);
            const currentRideStatus = response.data.ride.status;
            
            // Only set if ride is actually ongoing
            if (currentRideStatus === 'ongoing') {
              setOngoingRide(rideData);
              setRideStatus('ongoing');
            } else {
              // Ride is not ongoing anymore, clear it
              console.log('Ride is not ongoing, clearing from localStorage');
              localStorage.removeItem('ongoingRide');
              setOngoingRide(null);
            }
          } catch (error) {
            console.error('Error validating ride:', error);
            // If ride not found or error, clear it
            localStorage.removeItem('ongoingRide');
            setOngoingRide(null);
          }
        };
        
        validateRide();
      } catch (error) {
        console.error('Error parsing saved ride:', error);
        localStorage.removeItem('ongoingRide');
      }
    }
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit("join", { userType: "user", userId: user._id });

      socket.on("ride-accepted", data => {
        console.log('=== RIDE ACCEPTED DEBUG ===');
        console.log('Data received:', data);
        console.log('Data.ride.otp:', data.ride?.otp);
        console.log('Data.otp:', data.otp);
        console.log('=== END RIDE ACCEPTED DEBUG ===');
        
        setCurrentRide(data.ride);
        setRideOtp(data.otp); // Use the OTP from root level which is guaranteed to be correct
        setRideStatus("accepted");
        setShowWaitingForDriver(true);
      });
      socket.on("ride-started", data => {
        console.log("🚀 HOME: Ride started event received:", data);
        setCurrentRide(data.ride);
        setOngoingRide(data.ride); // Track for green bar
        setRideStatus("ongoing");
        
        // Persist to localStorage
        localStorage.setItem('ongoingRide', JSON.stringify(data.ride));
        
        setShowWaitingForDriver(false); // Close the waiting panel
        toast.success("Your ride has started!");
        console.log("🚀 HOME: Navigating to /user-ride-view with data:", data.ride);
        navigate("/user-ride-view", {
          state: {
            rideData: data.ride,
            userDetails: user,
          },
          replace: true
        });
      });
      socket.on("ride-completed", () => {
        setRideStatus("completed");
        setCurrentRide(null);
        setOngoingRide(null); // Clear ongoing ride
        localStorage.removeItem('ongoingRide'); // Clear from storage
        setShowWaitingForDriver(false);
        toast.success("Ride completed!");
      });
      socket.on("ride-ended", (data) => {
        setRideStatus("completed");
        setCompletedRide(data.ride || ongoingRide); // Store ride data for payment
        setCurrentRide(null);
        setOngoingRide(null); // Clear ongoing ride
        localStorage.removeItem('ongoingRide'); // Clear from storage
        setShowWaitingForDriver(false);
        toast.success("Ride completed!");
        
        // Show payment modal after 2 seconds
        setTimeout(() => {
          setShowPaymentModal(true);
        }, 2000);
      });
      socket.on("payment-success", () => {
        setOngoingRide(null); // Clear ongoing ride after payment
        localStorage.removeItem('ongoingRide'); // Clear from storage
        toast.success("Payment successful!");
      });
      return () => {
        socket.off("ride-accepted");
        socket.off("ride-started");
        socket.off("ride-completed");
        socket.off("ride-ended");
        socket.off("payment-success");
      };
    }
  }, [socket, user, navigate]);

  const animateInputAndLocationSearchPanel = toTop => {
    gsap.to(inputPanelRef.current, {
      top: toTop ? 0 : "65%",
      duration: 0.4,
      ease: "power2.out",
    });
    gsap.to(overlayRef.current, {
      opacity: toTop ? 1 : 0,
      duration: 0.4,
      pointerEvents: toTop ? "auto" : "none",
    });
    gsap.to(locationSearchPanelContainerRef.current, {
      height: toTop ? "calc(100vh - 180px)" : "0px",
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleInputClick = field => {
    setActiveField(field);
    setPanelOpen(true);
    setInputAtTop(true);
    animateInputAndLocationSearchPanel(true);
    setShowVehiclePanel(false);
    setShowConfirmRide(false);
    setShowWaitingForDriver(false);
  };

  const togglePanelPosition = () => {
    if (showVehiclePanel || showConfirmRide || showWaitingForDriver) return;
    const toTop = !inputAtTop;
    setInputAtTop(toTop);
    setPanelOpen(toTop);
    animateInputAndLocationSearchPanel(toTop);
  };

  // Animated traffic light effect
  useEffect(() => {
    if (showWelcomeAnimation) {
      const sequence = [
        { state: 'red', duration: 1000 },
        { state: 'yellow', duration: 500 },
        { state: 'green', duration: 1000 }
      ];
      
      let currentIndex = 0;
      const runSequence = () => {
        if (currentIndex < sequence.length) {
          setTrafficLightState(sequence[currentIndex].state);
          setTimeout(() => {
            currentIndex++;
            runSequence();
          }, sequence[currentIndex].duration);
        } else {
          setShowWelcomeAnimation(false);
        }
      };
      runSequence();
    }
  }, [showWelcomeAnimation]);

  const findTrip = async () => {
    if (!pickup || !destination) {
      toast.error("Please enter both pickup and destination!");
      return;
    }
    
    // Start welcome animation
    setShowWelcomeAnimation(true);
    
    setPanelOpen(false);
    setInputAtTop(false);
    animateInputAndLocationSearchPanel(false);
    setShowVehiclePanel(true);
    setShowConfirmRide(false);
    setShowWaitingForDriver(false);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare?pickup=${encodeURIComponent(
          pickup
        )}&destination=${encodeURIComponent(destination)}`
      );setFare(res.data?.fare || res.data);
    } catch (err) {setFare(null);
      toast.error("Failed to fetch fare. Try again.");
    }
  };

  // Called by VehiclePanel when user picks vehicle
  const confirmVehicleSelection = vehicle => {
    setSelectedVehicle(vehicle);
    setShowVehiclePanel(false);
    setPanelOpen(false);
    setInputAtTop(false);
    animateInputAndLocationSearchPanel(false);
    setShowConfirmRide(true); // Show confirm step
  };

  // Called by ConfirmRide confirm button
  const handleConfirmRide = () => {
    setShowConfirmRide(false);
    
    const rideData = {
      pickup,
      pickupCoords,
      destination,
      destinationCoords,
      vehicleType: selectedVehicle?.type,
      vehicleDisplayName: selectedVehicle?.name,
      fare: selectedVehicle?.price,
      distance: routeCoordinates && routeCoordinates.length > 0
        ? routeCoordinates[routeCoordinates.length - 1]?.distance || 0 : 0,
      duration: eta || 0,
    };navigate("/looking-for-driver", { state: { rideData } });
  };

  const closeConfirmRide = () => setShowConfirmRide(false);
  const closeVehiclePanel = () => setShowVehiclePanel(false);

  // Debounced location suggestions
  const fetchSuggestions = input => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      if (!input || input.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions?input=${encodeURIComponent(input)}`
        );
        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSuggestions([]);
      }
    }, 600);
  };

  const handlePickupChange = e => {
    setPickup(e.target.value);
    setActiveField("pickup");
    setPanelOpen(true);
    setInputAtTop(true);
    fetchSuggestions(e.target.value);
  };

  const handleDestinationChange = e => {
    setDestination(e.target.value);
    setActiveField("destination");
    setPanelOpen(true);
    setInputAtTop(true);
    fetchSuggestions(e.target.value);
  };

  const handleSuggestionClick = location => {
    if (activeField === "pickup") setPickup(location);
    else setDestination(location);
    setPanelOpen(false);
    setSuggestions([]);
  };

  // Fix the location initialization - ensure it's more stable
  useEffect(() => {
    if (navigator.geolocation && !userLocation && !locationPermissionGranted) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };setUserLocation(location);
          setLocationPermissionGranted(true);
          toast.success("Location access granted!");
        },
        error => {// Use Delhi coordinates as fallback
          const fallbackLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(fallbackLocation);
          setLocationPermissionGranted(true);
          toast.error("Using default location");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []); // Run only once on mount

  const handleLocationGranted = location => {setUserLocation(location);
    setLocationPermissionGranted(true);
    toast.success("Location access granted!");
  };

  const handleLocationDenied = error => {toast.error("Location access is required for the best experience");
    // Use Delhi coordinates as fallback
    setUserLocation({ lat: 28.6139, lng: 77.2090 });
    setLocationPermissionGranted(true);
  };

  // Make the readyForMap condition more stable
  const readyForMap = Boolean(locationPermissionGranted && userLocation && userLocation.lat && userLocation.lng);

  // Debug ongoing ride state

  // Add debug logging to see what's happening// Fix the map rendering section - don't show loader if location is already granted
  return (
    <div className="h-screen relative overflow-hidden bg-gray-100 flex justify-center">
      <div className="w-full max-w-[1920px] h-full relative">
      {/* Ongoing Ride Bar - Green bar below header */}
      {ongoingRide && (
        <div 
          onClick={() => navigate('/user-ride-view', { 
            state: { rideData: ongoingRide },
            replace: true 
          })}
          className="absolute top-20 sm:top-24 left-4 right-4 sm:left-6 sm:right-6 bg-green-500 hover:bg-green-600 cursor-pointer transition-colors p-3 rounded-xl flex items-center justify-between shadow-lg z-30"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="text-white">
              <p className="font-semibold text-sm">Ride in Progress</p>
              <p className="text-xs opacity-90">Tap to view your ride</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium">₹{ongoingRide.fare}</span>
            <i className="ri-arrow-right-line text-white text-lg"></i>
          </div>
        </div>
      )}
      
      {!locationPermissionGranted && (
        <LocationPermission
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
        />
      )}
      
      {/* Map Section - Improved styling and size */}
      <div className="absolute inset-0 z-0">
        {locationPermissionGranted && userLocation ? (
          <div className="w-full h-full">
            <LiveMap
              userLocation={userLocation}
              captainLocation={nearbyCaptains.length > 0 ? nearbyCaptains[0] : null}
              pickupLocation={pickupCoords}
              destinationLocation={destinationCoords}
              routeCoordinates={routeCoordinates}
              showRoute={showRoute}
              className="w-full h-full min-h-screen"
              key="main-map"
            />
            {/* Map overlay for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
            <span className="mt-6 text-lg text-gray-600 dark:text-gray-300 font-medium">Getting your location...</span>
            <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please ensure location access is enabled</span>
          </div>
        )}
      </div>

      <div ref={overlayRef} className="absolute inset-0 bg-white opacity-0 pointer-events-none z-10 transition-opacity" />
      
      {/* Header - Improved spacing and styling */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="flex justify-between items-center bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-lg border border-white/20">
          <img 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-md" 
            src={logo || "/placeholder.svg"} 
            alt="Orbix Logo" 
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button 
              onClick={() => setShowWallet(true)} 
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-200"
              title="Wallet"
            >
              <i className="ri-wallet-3-line text-gray-700 dark:text-gray-200 text-lg"></i>
            </button>
            <button 
              onClick={() => setShowSidebar(true)} 
              className="w-10 h-10 sm:w-11 sm:h-11 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all duration-200"
              title="Menu"
            >
              <i className="ri-menu-line text-gray-700 dark:text-gray-200 text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ETA and Driver Status - Improved positioning */}
      {eta && showRoute && (
        <div className="absolute top-24 right-4 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3 border border-white/20">
          <div className="flex items-center space-x-2">
            <i className="ri-time-line text-blue-600 dark:text-blue-400"></i>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">ETA: {Math.round(eta)} min</span>
          </div>
        </div>
      )}

      {nearbyCaptains.length > 0 && (
        <div className="absolute top-40 right-4 z-20 bg-green-50/95 dark:bg-green-900/30 border border-green-200 dark:border-green-700 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700 dark:text-green-300">{nearbyCaptains.length} drivers nearby</span>
          </div>
        </div>
      )}

      {/* Input panel - Enhanced styling and spacing */}
      <div
        ref={inputPanelRef}
        className={`absolute ${inputAtTop ? "top-0" : "top-[65%]"} left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-30 bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl shadow-2xl transition-all duration-500 border-t border-gray-200 dark:border-gray-700`}
      >
        <div className="p-5 sm:p-7">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6"></div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Find a trip</h4>
            <button onClick={togglePanelPosition} className="hover:bg-gray-100 p-2 rounded-full transition-colors">
              <i className={`ri-arrow-${inputAtTop ? "down" : "up"}-s-line text-2xl text-gray-600`}></i>
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-6 flex flex-col items-center space-y-2 z-10">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              <div className="w-0.5 h-8 bg-gray-300"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            </div>
            <input
              onClick={() => handleInputClick("pickup")}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-gray-100 dark:bg-gray-700 pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl w-full border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Add a pick-up location"
            />
            <input
              onClick={() => handleInputClick("destination")}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-gray-100 dark:bg-gray-700 pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg rounded-xl w-full border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mt-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder="Enter your destination"
            />
          </div>
          <button
            onClick={findTrip}
            disabled={!pickup || !destination}
            className="bg-black text-white px-6 py-3 sm:py-4 rounded-xl mt-4 w-full text-base sm:text-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-all hover:bg-gray-800 active:scale-95"
          >
            Find Trip
          </button>
        </div>
      </div>

      {/* Location search panel */}
      <div
        ref={locationSearchPanelContainerRef}
        className="absolute bottom-0 left-0 right-0 h-0 overflow-y-auto bg-white z-20 rounded-t-3xl"
      >
        {panelOpen && (
          <LocationSearchPanel
            activeField={activeField}
            setPickup={setPickup}
            setDestination={setDestination}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
      </div>

      {/* Other modals/panels */}
      {showVehiclePanel && (
        <VehiclePanel
          setShowVehiclePanel={setShowVehiclePanel}
          onConfirm={confirmVehicleSelection}
          fare={fare}
          setFare={setFare}
          onClose={closeVehiclePanel}
        />
      )}

      {showConfirmRide && (
        <ConfirmRidePanel
          selectedVehicle={selectedVehicle}
          pickup={pickup}
          destination={destination}
          fare={selectedVehicle?.price}
          onConfirm={handleConfirmRide}
          onClose={() => {
            setShowConfirmRide(false);
            setShowVehiclePanel(true);
          }}
        />
      )}

      {showWaitingForDriver && (
        <WaitingForDriver
          setShowWaitingForDriver={setShowWaitingForDriver}
          ride={currentRide}
          rideStatus={rideStatus}
          otp={rideOtp}
        />
      )}

      <Wallet isOpen={showWallet} onClose={() => setShowWallet(false)} />
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      
      {showPaymentModal && completedRide && (
        <RidePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setCompletedRide(null);
            setOngoingRide(null); // Ensure ongoing ride is cleared
            localStorage.removeItem('ongoingRide'); // Clear from storage
            toast.info('You can complete payment later');
          }}
          ride={completedRide}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            setCompletedRide(null);
            setOngoingRide(null); // Ensure ongoing ride is cleared
            localStorage.removeItem('ongoingRide'); // Clear from storage
            toast.success('Payment completed successfully!');
          }}
        />
      )}
      </div>
    </div>
  );
};

export default Home;
