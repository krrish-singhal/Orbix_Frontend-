"use client"

import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";
import LiveMap from "../components/LiveMap";
import OtpInput from "../components/OtpInput";
import toast from "react-hot-toast";
import { geocodeAddress, getRoute, getVehicleImage } from "../../utils/mapUtils";

const CaptainConfirmRide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);

  const initialRide = location.state?.rideData || null;
  const initialOtp = location.state?.otp || "";

  const [ride, setRide] = useState(initialRide);
  const [otp, setOtp] = useState("");
  const [expectedOtp, setExpectedOtp] = useState(initialOtp);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [showRoute, setShowRoute] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpReady, setOtpReady] = useState(false);

  useEffect(() => {
    if (!ride) return;
    (async () => {
      try {
        const pickup = await geocodeAddress(ride.pickup);
        const dest = await geocodeAddress(ride.destination);
        setPickupCoords(pickup);
        setDestinationCoords(dest);
        if (pickup && dest) {
          const r = await getRoute(pickup, dest);
          if (r) setRouteCoordinates(r.coordinates || []);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [ride]);

  useEffect(() => {
    // Get current position for captain marker
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCaptainLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRideAccepted = (data) => {
      // Backend may send a richer object when ride is accepted
      if (data?.ride) setRide(data.ride);
      if (data?.otp) setExpectedOtp(data.otp);
      setShowRoute(true);
    };

    const handleRideStartSuccess = (data) => {
      toast.success(data.message || "OTP Verified! Starting ride...", {
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
        duration: 3000
      });
      // Navigate to ride in-progress / complete-ride page
      navigate('/complete-ride', { state: { rideData: data.ride || ride, captainDetails: captain, isUser: false } });
    };

    const handleInvalidOtp = (data) => {
      toast.error(data.message || "Wrong OTP entered. Please try again.", {
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: '600',
          borderRadius: '8px',
          padding: '12px 16px'
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#ef4444',
        },
        duration: 3000
      });
      setLoading(false);
    };

    socket.on('ride-accepted', handleRideAccepted);
    socket.on('ride-start-success', handleRideStartSuccess);
    socket.on('invalid-otp', handleInvalidOtp);

    return () => {
      socket.off('ride-accepted', handleRideAccepted);
      socket.off('ride-start-success', handleRideStartSuccess);
      socket.off('invalid-otp', handleInvalidOtp);
    };
  }, [socket, ride, captain, navigate]);

  const handleOtpComplete = (val) => {
    setOtp(String(val).trim());
    setOtpReady(String(val).trim().length === 6);
  };

  const startRide = () => {
    if (!ride) return toast.error('Missing ride information');
    if (!otp || !/^\d{6}$/.test(otp)) return toast.error('Enter a valid 6-digit OTP');
    setLoading(true);
    try {
      socket.emit('start-ride', { rideId: ride._id || ride.rideId, otp, captainId: captain?._id });
      toast.loading('Verifying OTP...');
    } catch (e) {
      setLoading(false);
      toast.error('Failed to start ride');
    }
  };

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No ride selected. Go back to home to accept rides.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white">Confirm Ride - Enter OTP</h2>
          <div></div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 pt-20">
        <LiveMap
          userLocation={userLocation}
          captainLocation={captainLocation}
          pickupLocation={pickupCoords}
          destinationLocation={destinationCoords}
          routeCoordinates={routeCoordinates}
          showRoute={showRoute}
          className="w-full h-full"
        />
      </div>

      {/* Bottom OTP panel - improved styling */}
      <div className="absolute left-0 right-0 bottom-0 flex justify-center z-50">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl px-6 pt-2 pb-6 border-t-4 border-green-500 relative" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 60 }}>
          {/* Car Image - moved down, more spacing */}
          <div className="flex justify-center mb-4" style={{ marginTop: '-24px' }}>
            <div className="bg-white rounded-xl shadow p-2">
              <img
                className="h-20 w-auto object-contain drop-shadow-md"
                src={getVehicleImage(ride.vehicleType)}
                alt={ride.vehicleDisplayName || ride.vehicleType}
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))' }}
              />
            </div>
          </div>
          {/* Pickup and Destination */}
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-map-pin-user-fill text-green-600 dark:text-green-400 text-base"></i>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Pickup</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{ride.pickup}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-map-pin-2-fill text-red-600 dark:text-red-400 text-base"></i>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Destination</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{ride.destination}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-currency-line text-green-600 dark:text-green-400 text-base"></i>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">Fare</div>
                <div className="font-bold text-green-600 dark:text-green-400 text-lg">₹{ride.fare || ''}</div>
              </div>
            </div>
          </div>
          <div className="text-center" style={{ marginBottom: '0.25rem', marginTop: '-0.5rem' }}>
            <p className="text-base text-gray-700 dark:text-gray-200 font-semibold tracking-wide">Enter passenger OTP to start ride</p>
          </div>
          <div className="flex justify-center mb-6">
            <OtpInput length={6} onComplete={handleOtpComplete} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold text-lg border-none shadow-lg"
              style={{ minWidth: '120px', minHeight: '48px', opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={startRide}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all border-none ${otpReady && !loading ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              style={{ minWidth: '120px', minHeight: '48px', opacity: (!otpReady || loading) ? 0.7 : 1 }}
              disabled={!otpReady || loading}
            >
              {loading ? 'Starting...' : 'Start Ride'}
            </button>
          </div>
        </div>
        {/* Overlay to dim map behind panel for clarity */}
        <div className="absolute left-0 right-0 bottom-0 h-2/5 bg-gradient-to-t from-white/95 via-white/80 to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

export default CaptainConfirmRide;
