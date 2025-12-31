import React, { useState, useEffect, useContext } from "react";
import { useRef } from "react";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { CaptainDataContext } from "../context/CaptainContext";
import LiveMap from "../components/LiveMap";
import axios from "axios";
import toast from "react-hot-toast";
import { geocodeAddress, getRoute } from "../../utils/mapUtils";

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
        { rideId: rideData._id, rating, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
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
    const panelRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);
  const { captain } = useContext(CaptainDataContext);
  const { rideData: initialRideData, captainDetails, isUser } = location.state || {};

  const [rideData, setRideData] = useState(initialRideData);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
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

  // GSAP animation for bottom panel (slide up/down and expand/collapse)
  useEffect(() => {
    if (panelRef.current) {
      if (panelExpanded) {
        gsap.to(panelRef.current, {
          y: 0,
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: '0px',
          duration: 0.5,
          ease: 'power3.out',
        });
      } else {
        gsap.to(panelRef.current, {
          y: 0,
          height: '',
          maxHeight: '32vh',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          duration: 0.5,
          ease: 'power3.out',
        });
      }
    }
  }, [panelExpanded]);

  useEffect(() => {
    if (!rideData) {
      navigate(isUser ? "/home" : "/captain-home");
      return;
    }
    getCurrentLocation();
    // If distance or duration is missing, fetch and update rideData
    if (!rideData.distance || !rideData.duration) {
      const fetchAndSetDistanceDuration = async () => {
        try {
          const [pickupResult, destinationResult] = await Promise.all([
            geocodeAddress(rideData.pickup),
            geocodeAddress(rideData.destination)
          ]);
          if (pickupResult && destinationResult) {
            setPickupLocation(pickupResult);
            setDestinationLocation(destinationResult);
            const route = await getRoute(
              pickupResult.lat,
              pickupResult.lng,
              destinationResult.lat,
              destinationResult.lng
            );
            if (route) {
              setRouteCoordinates(route.coordinates);
              setEta(route.duration);
              setRideData(prev => ({ ...prev, distance: route.distance, duration: route.duration }));
            }
          }
        } catch (error) {
          console.error("Error fetching coordinates:", error);
        }
      };
      fetchAndSetDistanceDuration();
    } else {
      fetchLocationCoordinates();
    }
  }, [rideData, isUser, navigate]);

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
        // Show feedback modal for user after ride completion
        if (isUser) {
          setShowRatingModal(true);
        } else {
          setTimeout(() => {
            navigate("/captain-home");
          }, 1500);
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
        const route = await getRoute(
          pickupResult.lat,
          pickupResult.lng,
          destinationResult.lat,
          destinationResult.lng
        );
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
            if (socket) {
              socket.emit("update-location-user", {
                userId: user._id,
                location: { ltd: location.lat, lng: location.lng },
              });
            }
          } else {
            setCaptainLocation(location);
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  const handleFinishRide = () => {
    if (!isUser && captain) {
      // For captains, directly finish ride and redirect to home
      confirmFinishRide();
    } else {
      // For users, show finish confirmation modal
      setShowFinishModal(true);
    }
  };

  const confirmFinishRide = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end`,
        { rideId: rideData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.ride) {
        setRideStatus("completed");
        setShowFinishModal(false);
        if (socket) {
          socket.emit("ride-ended", {
            rideId: rideData._id,
            userId: rideData.user,
            earnings: response.data.earnings
          });
        }
        toast.success("Ride completed successfully!");
        setTimeout(() => {
          navigate("/captain-home");
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
    toast.success("Thank you for your feedback!");
    setTimeout(() => {
      navigate("/home");
    }, 1000);
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
    <div className="h-screen relative bg-gray-50 dark:bg-gray-900 pb-[32vh]">
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
      <div className="absolute inset-0 pt-20">
        <LiveMap
          userLocation={userLocation}
          captainLocation={captainLocation}
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          endLocation={rideStatus === 'completed' ? (rideData?.endLocation || destinationLocation) : null}
          routeCoordinates={showRoute ? routeCoordinates : []}
          showRoute={showRoute}
        />
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
      
      {/* Bottom Panel - Always visible during ride */}
      {/* Bottom Panel as GSAP sliding panel */}
      <div
        ref={panelRef}
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700 overflow-y-auto ${panelExpanded ? '' : 'rounded-t-3xl max-h-[32vh]'}`}
        style={{ willChange: 'transform', touchAction: 'pan-y', height: panelExpanded ? '100vh' : '', maxHeight: panelExpanded ? '100vh' : '32vh' }}
      >
        <div className="px-6 py-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {(isUser 
                      ? (captainDetails?.fullname?.firstname?.charAt(0) || captainDetails?.fullname?.charAt?.(0) || 'C')
                      : (rideData.user?.fullname?.firstname?.charAt(0) || rideData.user?.fullname?.charAt?.(0) || 'U')
                    ).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {isUser 
                      ? (typeof captainDetails?.fullname === 'string' 
                          ? captainDetails.fullname 
                          : `${captainDetails?.fullname?.firstname || ''} ${captainDetails?.fullname?.lastname || ''}`.trim() || 'Captain')
                      : (typeof rideData.user?.fullname === 'string'
                          ? rideData.user.fullname
                          : `${rideData.user?.fullname?.firstname || ''} ${rideData.user?.fullname?.lastname || ''}`.trim() || 'Passenger')
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
                <div className="text-sm text-gray-600 dark:text-gray-400">Fare</div>
              </div>
            </div>
            {/* Trip Route */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pickup</p>
                  <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{rideData.pickup}</p>
                </div>
              </div>
              <div className="border-l-2 border-gray-300 dark:border-gray-600 ml-1.5 h-4"></div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
                  <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{rideData.destination}</p>
                </div>
              </div>
            </div>
            {/* Small Slider Indicator (click/drag to expand/collapse) */}
            <div className="flex justify-center mb-6 cursor-pointer select-none" onClick={() => setPanelExpanded((prev) => !prev)}>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => navigate(isUser ? '/home' : '/captain-home')}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold shadow hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
                style={{ maxWidth: 180 }}
              >
                Cancel Ride
              </button>
              <button
                onClick={handleFinishRide}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading || rideStatus === 'completed'}
                style={{ maxWidth: 180 }}
              >
                Finish Ride
              </button>
            </div>
            {/* Info Section for User */}
            {isUser && (
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
                <i className="ri-steering-2-line text-blue-600 dark:text-blue-400 text-2xl mb-2 block"></i>
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  Your captain is driving you to destination
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rating Modal for Users - Only after ride completion */}
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