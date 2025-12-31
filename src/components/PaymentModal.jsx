import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  rideData,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: '📱',
      description: 'PhonePe, Paytm, GPay'
    },
    {
      id: 'card',
      name: 'Card',
      icon: '💳',
      description: 'Credit or Debit Card'
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: '💵',
      description: 'Pay to driver'
    }
  ];

  const handlePaymentMethodSelect = async (methodId) => {
    if (methodId === 'cash') {
      try {
        setIsProcessing(true);
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/payments/payment/process`,
          {
            rideId: rideData._id,
            paymentMethod: 'cash'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          toast.success('Payment confirmed!');
          onPaymentSuccess && onPaymentSuccess(response.data);
          onClose();
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast.error(error.response?.data?.message || 'Payment failed');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setSelectedMethod(methodId);
    }
  };

  const handleProceed = () => {
    if (selectedMethod === 'upi') {
      onClose();
      toast.success('Opening UPI payment...');
    } else if (selectedMethod === 'card') {
      onClose();
      toast.success('Opening card payment...');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full bg-white rounded-t-3xl p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">Select Payment Method</h2>
        <p className="text-gray-600 mb-6">Choose how you want to pay</p>

        {/* Ride Fare */}
        <div className="bg-[#eeeeee] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Ride Fare</span>
            <span className="text-2xl font-bold">₹{rideData?.fare}</span>
          </div>
          <div className="text-sm text-gray-500">
            <p className="truncate">📍 {rideData?.pickup}</p>
            <p className="truncate">🎯 {rideData?.destination}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handlePaymentMethodSelect(method.id)}
              disabled={isProcessing}
              className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-all ${
                selectedMethod === method.id
                  ? 'border-[#111] bg-[#f5f5f5]'
                  : 'border-gray-200 bg-white hover:bg-[#fafafa]'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-3xl">{method.icon}</span>
              <div className="flex-1 text-left">
                <h4 className="font-semibold">{method.name}</h4>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              {selectedMethod === method.id && (
                <span className="text-green-600 text-xl">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Proceed Button */}
        {selectedMethod && selectedMethod !== 'cash' && (
          <button
            onClick={handleProceed}
            disabled={isProcessing}
            className="bg-[#111] text-white font-semibold rounded-lg px-4 py-3 w-full text-lg mb-3"
          >
            {isProcessing ? 'Processing...' : 'Proceed to Pay'}
          </button>
        )}

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="bg-[#eeeeee] text-gray-700 font-medium rounded-lg px-4 py-3 w-full text-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;

