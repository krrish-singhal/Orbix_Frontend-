import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RideTracking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { rideData, captainDetails, otp } = location.state || {};
    const [rideStatus, setRideStatus] = useState('ongoing');
    const [estimatedTime, setEstimatedTime] = useState(15); // minutes

    useEffect(() => {
        if (!rideData || !captainDetails) {
            navigate('/home');
            return;
        }

        // Simulate ride progress
        const interval = setInterval(() => {
            setEstimatedTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [rideData, captainDetails, navigate]);

    const completeRide = () => {
        // Here you would normally call an API to complete the ride
        alert('Ride completed successfully!');
        navigate('/home');
    };

    const callDriver = () => {
        if (captainDetails?.phone) {
            window.open(`tel:${captainDetails.phone}`, '_self');
        }
    };

    const sendMessage = () => {
        // Here you would open a chat interface
        alert('Chat feature coming soon!');
    };

    if (!rideData || !captainDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 z-10">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/home')}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-semibold">Ride in Progress</h1>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">Live</span>
                    </div>
                </div>
            </div>

            {/* Dummy Map */}
            <div className="flex-1 relative bg-gradient-to-br from-green-100 to-blue-100">
                {/* Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-50"></div>
                
                {/* Map Grid Pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}></div>

                {/* Route Line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
                    <path
                        d="M100 500 Q150 400 200 300 T300 100"
                        stroke="#3B82F6"
                        strokeWidth="4"
                        strokeDasharray="10,5"
                        fill="none"
                        className="animate-pulse"
                    />
                </svg>

                {/* Pickup Location */}
                <div className="absolute bottom-32 left-8 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                    <div className="bg-white rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-xs font-medium text-gray-600">Pickup</p>
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
                            {rideData.pickup?.split(',')[0] || 'Pickup Location'}
                        </p>
                    </div>
                </div>

                {/* Destination */}
                <div className="absolute top-20 right-8 flex items-center space-x-2">
                    <div className="bg-white rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-xs font-medium text-gray-600">Destination</p>
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-32">
                            {rideData.destination?.split(',')[0] || 'Destination'}
                        </p>
                    </div>
                    <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>

                {/* Moving Car Icon */}
                <div className="absolute bottom-44 left-20 animate-pulse">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.5 2.5A1.5 1.5 0 0110 1h4a1.5 1.5 0 011.5 1.5v.5h1a2 2 0 012 2v2.5a.5.5 0 01-.5.5h-1.75l-.15.6a3 3 0 01-2.9 2.4H5.5a3 3 0 01-2.9-2.4L2.45 7.5H.5a.5.5 0 01-.5-.5V5a2 2 0 012-2h1v-.5zM10 3v.5h4V3h-4z"/>
                        </svg>
                    </div>
                </div>

                {/* Floating Status Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="font-bold text-gray-600 capitalize">
                                    {(typeof captainDetails.name === 'string' ? captainDetails.name : 'C').charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 capitalize">{captainDetails.name || 'Captain'}</h3>
                                <p className="text-sm text-gray-600 capitalize">{captainDetails.vehicle?.vehicleType} • {captainDetails.vehicle?.plate}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">ETA</p>
                            <p className="font-bold text-lg text-blue-600">{estimatedTime} min</p>
                        </div>
                    </div>

                    {/* Trip Details */}
                    <div className="border-t pt-3 mb-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-600">Trip Fare</p>
                                <p className="font-bold text-xl text-green-600">₹{rideData.fare}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Distance</p>
                                <p className="font-semibold text-gray-800">
                                    {rideData.distance ? `${rideData.distance.toFixed(1)} km` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={callDriver}
                            className="bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>Call</span>
                        </button>
                        <button
                            onClick={sendMessage}
                            className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Chat</span>
                        </button>
                        <button
                            onClick={completeRide}
                            className="bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Complete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RideTracking;
