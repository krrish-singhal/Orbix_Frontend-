import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RideStatusPanel = ({ 
  isOpen, 
  onClose, 
  rideData, 
  onFinishRide, 
  onCancelRide,
  onWaitingStart,
  onWaitingEnd,
  isCaptain = false 
}) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingStartTime, setWaitingStartTime] = useState(null);
  const [waitingCharges, setWaitingCharges] = useState(0);

  const handleWaitToggle = () => {
    if (!isWaiting) {
      // Start waiting
      const startTime = Date.now();
      setWaitingStartTime(startTime);
      setIsWaiting(true);
      onWaitingStart && onWaitingStart(startTime);
      toast.success('Waiting timer started');
    } else {
      // End waiting
      const endTime = Date.now();
      const waitingMinutes = Math.ceil((endTime - waitingStartTime) / 60000);
      const charges = waitingMinutes * 2; // ₹2 per minute
      setWaitingCharges(charges);
      setIsWaiting(false);
      onWaitingEnd && onWaitingEnd(charges);
      toast.success(`Waiting charges: ₹${charges} (${waitingMinutes} mins)`);
    }
  };

  const handleCancelRide = () => {
    if (window.confirm('Are you sure you want to cancel this ride? Cancellation charges may apply.')) {
      onCancelRide();
      onClose();
    }
  };

  const handleFinishRide = () => {
    if (isWaiting) {
      toast.error('Please stop waiting timer first');
      return;
    }
    if (window.confirm('Are you sure you want to finish this ride?')) {
      onFinishRide(waitingCharges);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-2">
              <button
                onClick={onClose}
                className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"
              ></button>
            </div>

            <div className="p-6 pb-8">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ride Controls
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your ongoing ride
                </p>
              </div>

              {/* Ride Details Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Base Fare</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{rideData?.fare || 0}
                  </span>
                </div>
                {waitingCharges > 0 && (
                  <div className="flex items-center justify-between mb-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <span className="text-sm text-orange-600 dark:text-orange-400">Waiting Charges</span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      +₹{waitingCharges}
                    </span>
                  </div>
                )}
                {waitingCharges > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-blue-300 dark:border-blue-600">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Fare</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      ₹{(rideData?.fare || 0) + waitingCharges}
                    </span>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="space-y-3">
                {/* Wait Button - Captain Only */}
                {isCaptain && (
                  <button
                    onClick={handleWaitToggle}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isWaiting
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-orange-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isWaiting ? 'bg-orange-500' : 'bg-orange-400'
                      }`}>
                        <i className={`ri-${isWaiting ? 'stop' : 'time'}-line text-white text-xl`}></i>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {isWaiting ? 'Stop Waiting' : 'Start Waiting'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isWaiting ? 'Timer running... ₹2/min' : 'Add waiting charges'}
                        </p>
                      </div>
                    </div>
                    {isWaiting && (
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                )}

                {/* Finish Ride Button - Captain Only */}
                {isCaptain && (
                  <button
                    onClick={handleFinishRide}
                    className="w-full p-4 rounded-xl border-2 bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Finish Ride
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Complete and process payment
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Cancel Ride Button */}
                <button
                  onClick={handleCancelRide}
                  className="w-full p-4 rounded-xl border-2 bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Cancel Ride
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Cancel ongoing trip
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RideStatusPanel;
