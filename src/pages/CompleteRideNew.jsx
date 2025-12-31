import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { CaptainDataContext } from "../context/CaptainContext";
import LiveMap from "../components/LiveMap";
import axios from "axios";
import toast from "react-hot-toast";
import { geocodeAddress, getRoute } from "../utils/mapUtils";

// Rating Modal Component
const RatingModal = ({ isOpen, onClose, rideData, onRatingSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRating = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/rate`,
        { 
          rideId: rideData._id, 
          rating, 
          feedback 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Thank you for your feedback!");
      onRatingSubmitted();
    } catch (error) {
      toast.error("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Rate Your Ride</h2>
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience (optional)"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows="3"
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={submitRating}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CompleteRide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);
  const { captain } = useContext(CaptainDataContext);
  
  const { rideData, captainDetails, isUser } = location.state || {};
  
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [showRoute, setShowRoute] = useState(true);
  const [rideStatus, setRideStatus] = useState("ongoing");
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (!rideData) {
      navigate(isUser ? "/home" : "/captain-home");
      return;
    }

    // Get current location and set up real-time tracking
    getCurrentLocation();
    
    // Parse pickup and destination coordinates if available
    fetchLocationCoordinates();

  }, [rideData, isUser, navigate]);

  // Socket events for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("update-location-user", (data) => {
        if (data.userId === rideData.user?._id || data.userId === user?._id) {
          setUserLocation({ lat: data.location.ltd, lng: data.location.lng });
        }
      });

      socket.on("update-location-captain", (data) => {
        if (data.userId === rideData.captain || data.captainId === captain?._id) {
          setCaptainLocation({ lat: data.location.ltd, lng: data.location.lng });
        }
      });

      socket.on("ride-ended", (data) => {
        setRideStatus("completed");
        toast.success("Ride completed successfully!");
        
        if (isUser) {
          // Show rating modal for user
          setTimeout(() => {
            setShowRatingModal(true);
          }, 1000);
        } else {
          // Captain goes back to home
          setTimeout(() => {
            navigate("/captain-home");
          }, 2000);
        }
      });

      return () => {
        socket.off("update-location-user");
        socket.off("update-location-captain");
        socket.off("ride-ended");
      };
    }
  }, [socket, isUser, navigate, rideData, user, captain]);

  const fetchLocationCoordinates = async () => {
    try {
      const [pickupResult, destinationResult] = await Promise.all([
        geocodeAddress(rideData.pickup),
        geocodeAddress(rideData.destination)
      ]);

      if (pickupResult && destinationResult) {
        setPickupLocation(pickupResult);
        setDestinationLocation(destinationResult);
        
        // Get route between pickup and destination
        const route = await getRoute(pickupResult, destinationResult);
        if (route) {
          setRouteCoordinates(route.coordinates);
          setEta(route.duration);
        }
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (isUser) {
            setUserLocation(location);
            // Emit user location to captain
            if (socket) {
              socket.emit("update-location-user", {
                userId: user._id,
                location: { ltd: location.lat, lng: location.lng },
              });
            }
          } else {
            setCaptainLocation(location);
            // Emit captain location to user
            if (socket) {
              socket.emit("update-location-captain", {
                userId: captain._id,
                location: { ltd: location.lat, lng: location.lng },
              });
            }
          }
        },
        (error) => {
          toast.error("Could not get location");
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 5000 
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  const handleFinishRide = () => {
    setShowFinishModal(true);
  };

  const confirmFinishRide = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end`,
        { rideId: rideData._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ride) {
        setRideStatus("completed");
        setShowFinishModal(false);
        
        // Emit ride completion to user
        if (socket) {
          socket.emit("ride-ended", {
            rideId: rideData._id,
            userId: rideData.user,
            earnings: response.data.earnings
          });
        }

        toast.success("Ride completed successfully!");
        
        // Navigate to complete ride page for payment
        setTimeout(() => {
          navigate("/captain-complete-ride", {
            state: {
              rideData: response.data.ride
            }
          });
        }, 1000);
      }
    } catch (error) {
      toast.error("Failed to complete ride");
      setShowFinishModal(false);
      setLoading(false);
    }
  };

  const handleRatingSubmitted = () => {
    setShowRatingModal(false);
    navigate("/home");
  };

  if (!rideData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ride details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isUser ? "Your Ride" : "Current Ride"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rideStatus === "ongoing" ? "In Progress" : "Completed"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Trip ID</div>
            <div className="text-sm font-mono text-gray-900 dark:text-white">
              #{rideData._id?.slice(-6)}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 pt-20">
        <LiveMap
          userLocation={userLocation}
          captainLocation={captainLocation}
          pickupCoords={pickupLocation}
          destinationCoords={destinationLocation}
          routeCoordinates={showRoute ? routeCoordinates : []}
          showRoute={showRoute}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <i className="ri-time-line text-blue-600 dark:text-blue-400"></i>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">ETA</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {Math.round(eta)} min
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {/* Driver/Passenger Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {isUser 
                    ? (captainDetails?.fullname?.charAt(0) || 'C')
                    : (rideData.user?.fullname?.charAt(0) || 'U')
                  }
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {isUser 
                    ? (captainDetails?.fullname || 'Captain')
                    : (rideData.user?.fullname || 'Passenger')
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isUser 
                    ? `${captainDetails?.vehicle?.plate || 'Vehicle'} • Rating: 4.8`
                    : `Passenger • Rating: 4.9`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{rideData.fare}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cash</div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <i className="ri-map-pin-user-fill text-green-600 dark:text-green-400"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">Pickup</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {rideData.pickup}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <i className="ri-map-pin-2-fill text-red-600 dark:text-red-400"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">Destination</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {rideData.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only for Captain */}
          {!isUser && rideStatus === "ongoing" && (
            <button
              onClick={handleFinishRide}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <i className="ri-check-circle-line mr-2 text-xl"></i>
              Finish Ride
            </button>
          )}

          {/* For User - just info */}
          {isUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center">
                <i className="ri-car-line text-blue-600 dark:text-blue-400 mr-2"></i>
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  Your driver will finish the ride when you reach your destination
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Finish Ride Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-circle-line text-green-600 dark:text-green-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Finish Ride
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to complete this ride?
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFinishModal(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFinishRide}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Finishing...</span>
                    </div>
                  ) : (
                    "Finish"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        rideData={rideData}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};

export default CompleteRide;