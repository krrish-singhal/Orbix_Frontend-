import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import LiveMap from '../components/LiveMap';
import RidePaymentModal from '../components/RidePaymentModal';
import toast from 'react-hot-toast';
import { geocodeAddress, getRoute, getVehicleImage } from '../../utils/mapUtils';

const UserRideView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useContext(SocketContext);
  
  const { rideData } = location.state || {};
  const [ride, setRide] = useState(rideData);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    console.log('UserRideView mounted with ride data:', ride);
    console.log('Pickup address:', ride?.pickup);
    console.log('Destination address:', ride?.destination);
    
    if (!ride) {
      console.warn('No ride data found, redirecting to home');
      navigate('/home');
      return;
    }
    
    // Save ride to localStorage for persistence
    localStorage.setItem('ongoingRide', JSON.stringify(ride));
    
    // Fetch coordinates from addresses
    fetchLocationCoordinates();
  }, []);

  const fetchLocationCoordinates = async () => {
    if (!ride?.pickup || !ride?.destination) {
      console.error('Missing pickup or destination address');
      setIsLoadingMap(false);
      // Auto-retry after 3 seconds
      setTimeout(() => {
        console.log('Auto-retrying map load...');
        fetchLocationCoordinates();
      }, 3000);
      return;
    }

    try {
      setIsLoadingMap(true);
      console.log('Geocoding pickup:', ride.pickup);
      console.log('Geocoding destination:', ride.destination);
      
      const [pickupResult, destinationResult] = await Promise.all([
        geocodeAddress(ride.pickup),
        geocodeAddress(ride.destination)
      ]);
      
      console.log('Pickup result:', pickupResult);
      console.log('Destination result:', destinationResult);
      
      if (pickupResult && destinationResult) {
        setPickupLocation(pickupResult);
        setDestinationLocation(destinationResult);
        
        // Get route
        const route = await getRoute(pickupResult, destinationResult);
        if (route) {
          setRouteCoordinates(route.coordinates);
        }
      } else {
        // Auto-retry if coordinates not found
        setTimeout(() => {
          console.log('Auto-retrying map load...');
          fetchLocationCoordinates();
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      // Auto-retry on error
      setTimeout(() => {
        console.log('Auto-retrying map load after error...');
        fetchLocationCoordinates();
      }, 3000);
    } finally {
      setIsLoadingMap(false);
    }
  };

  useEffect(() => {
    if (!socket || !ride) return;

    // Listen for ride updates
    socket.on('ride-ended', (data) => {
      toast.success('Ride completed!');
      
      // Clear ongoing ride from localStorage
      localStorage.removeItem('ongoingRide');
      
      // Show payment modal after 2 seconds
      setTimeout(() => {
        setShowPaymentModal(true);
      }, 2000);
    });

    socket.on('payment-success', (data) => {
      toast.success('Payment successful!');
      localStorage.removeItem('ongoingRide'); // Clear from storage
      setShowPaymentModal(false);
      navigate('/home');
    });

    // Listen for status updates from captain
    socket.on('ride-status-updated', (data) => {
      console.log('📢 User: Ride status updated:', data);
      
      if (data.status === 'cancelled') {
        toast.error(data.message || 'Your ride has been cancelled by the driver', {
          duration: 5000,
          icon: '❌'
        });
        localStorage.removeItem('ongoingRide');
        setTimeout(() => navigate('/home'), 3000);
      } else if (data.status === 'completed') {
        toast.success(data.message || 'Your ride has been completed', {
          duration: 4000,
          icon: '✅'
        });
        localStorage.removeItem('ongoingRide');
        setTimeout(() => {
          setShowPaymentModal(true);
        }, 2000);
      }
    });

    return () => {
      socket.off('ride-ended');
      socket.off('payment-success');
      socket.off('ride-status-updated');
    };
  }, [socket, ride, navigate]);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    localStorage.removeItem('ongoingRide');
    navigate('/home');
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    toast.info('You can complete payment later');
    navigate('/home');
  };

  if (!ride) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">No active ride</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header with Home Button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/home')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-4 py-2.5 shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <i className="ri-home-4-fill text-lg"></i>
          <span className="font-semibold text-sm">Home</span>
        </button>
      </div>

      {/* Map with Two Pins */}
      <div className="flex-1 relative">
        {isLoadingMap ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : pickupLocation && destinationLocation ? (
          <LiveMap
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            routeCoordinates={routeCoordinates}
            showRoute={true}
            markerType="user"
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Automatically retrying</p>
            </div>
          </div>
        )}

        {/* Ride Info Card */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Ride in Progress</h3>
              <p className="text-sm text-gray-500">Sit back and enjoy your ride</p>
            </div>
            <div className="relative">
              <img
                className="h-16 w-auto object-contain opacity-90"
                src={getVehicleImage(ride.vehicleType)}
                alt={ride.vehicleDisplayName || ride.vehicleType}
              />
            </div>
          </div>

          {/* Driver Info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {(ride.captain?.fullname?.firstname?.[0] || 'C').toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-white">
                {ride.captain?.fullname?.firstname} {ride.captain?.fullname?.lastname}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {ride.captain?.vehicle?.plate} • {ride.captain?.vehicle?.color} {ride.captain?.vehicle?.vehicleType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Fare</p>
              <p className="text-lg font-bold text-green-600">₹{ride.fare}</p>
            </div>
          </div>

          {/* Destination */}
          <div className="mt-4 flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-map-pin-2-fill text-red-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Destination</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                {ride.destination || ride.destinationAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <RidePaymentModal
        isOpen={showPaymentModal}
        rideDetails={ride}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </div>
  );
};

export default UserRideView;
