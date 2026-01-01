import React, { useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';

// Initialize Stripe (you'll add your publishable key in .env)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;


const PaymentForm = ({ rideDetails, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paymentMethod: 'card' // 'card' or 'upi'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent on backend
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments/create-payment-intent`,
        {
          amount: rideDetails.fare,
          rideId: rideDetails._id,
          customerName: formData.name,
          customerEmail: formData.email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { clientSecret } = data;

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        
        // Update ride status on backend
        try {
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/payments/confirm-stripe-payment`,
            {
              rideId: rideDetails._id,
              paymentIntentId: paymentIntent.id,
              amount: rideDetails.fare
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log('✅ Ride payment confirmed on backend');
        } catch (confirmError) {
          console.error('❌ Failed to confirm payment on backend:', confirmError);
          // Continue anyway as payment was successful
        }

        // Send email receipt
        try {
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/payments/send-receipt`,
            {
              rideId: rideDetails._id,
              customerName: formData.name,
              customerEmail: formData.email,
              paymentMethod: 'Credit Card',
              amount: rideDetails.fare,
              paymentIntentId: paymentIntent.id
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log('✅ Email receipt sent');
        } catch (receiptError) {
          console.log('⚠️ Receipt not sent (email may not be configured)');
          // Don't fail payment if receipt fails - silently continue
        }

        toast.success('Payment completed successfully!');
        
        // Immediately navigate to home
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUPIPayment = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      console.log('💳 Processing UPI payment...');
      
      // Process UPI payment (as per your existing logic)
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payments/process-upi`,
        {
          rideId: rideDetails._id,
          customerName: formData.name,
          customerEmail: formData.email,
          amount: rideDetails.fare
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✅ UPI payment processed:', response.data);

      // Send email receipt
      try {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/payments/send-receipt`,
          {
            rideId: rideDetails._id,
            customerName: formData.name,
            customerEmail: formData.email,
            paymentMethod: 'UPI',
            amount: rideDetails.fare
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('✅ Email receipt sent');
      } catch (receiptError) {
        console.log('⚠️ Receipt not sent (email may not be configured)');
        // Don't fail payment if receipt fails - silently continue
      }

      toast.success('Payment completed successfully!');
      
      // Immediately navigate to home
      onSuccess();
    } catch (error) {
      console.error('❌ UPI Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Complete Payment</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
          <i className="ri-close-line text-xl sm:text-2xl"></i>
        </button>
      </div>

      {/* Ride Details Summary */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <h3 className="font-semibold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Ride Details</h3>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-gray-600 flex-shrink-0">From:</span>
            <span className="text-gray-800 font-medium text-right truncate">{rideDetails.pickup}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-600 flex-shrink-0">To:</span>
            <span className="text-gray-800 font-medium text-right truncate">{rideDetails.destination}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-600 flex-shrink-0">Distance:</span>
            <span className="text-gray-800 font-medium">{rideDetails.distance}</span>
          </div>
          <div className="flex justify-between gap-2 pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-semibold">Total Amount:</span>
            <span className="text-green-600 font-bold text-base sm:text-lg">₹{rideDetails.fare}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Select Payment Method</label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
            className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
              formData.paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <i className="ri-bank-card-line text-xl sm:text-2xl mb-1"></i>
            <p className="text-xs sm:text-sm font-medium">Credit Card</p>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
            className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
              formData.paymentMethod === 'upi'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <i className="ri-smartphone-line text-xl sm:text-2xl mb-1"></i>
            <p className="text-xs sm:text-sm font-medium">UPI</p>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={formData.paymentMethod === 'card' ? handleCardPayment : handleUPIPayment}>
        {/* Personal Information */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Receipt will be sent to this email</p>
          </div>
        </div>

        {/* Card Details (only for card payment) */}
        {formData.paymentMethod === 'card' && (
          <div className="mb-4 sm:mb-6 space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Card Number</label>
              <div className="border border-gray-300 rounded-lg p-3">
                <CardNumberElement options={cardElementOptions} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Expiry Date</label>
                <div className="border border-gray-300 rounded-lg p-3">
                  <CardExpiryElement options={cardElementOptions} />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">CVC</label>
                <div className="border border-gray-300 rounded-lg p-3">
                  <CardCvcElement options={cardElementOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPI Instructions (only for UPI payment) */}
        {formData.paymentMethod === 'upi' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start space-x-2">
              <i className="ri-information-line text-blue-600 mt-0.5 text-sm sm:text-base"></i>
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-medium mb-1">UPI Payment Instructions:</p>
                <p>You will be redirected to your UPI app to complete the payment.</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !stripe}
          className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-white text-sm sm:text-base transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </span>
          ) : (
            `Pay ₹${rideDetails.fare}`
          )}
        </button>
      </form>
    </div>
  );
};

const RidePaymentModal = ({ isOpen, rideDetails, onSuccess, onCancel }) => {
  if (!isOpen || !rideDetails) return null;

  // Check if Stripe is not initialized
  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4">
          <div className="text-center">
            <div className="mb-4">
              <i className="ri-error-warning-line text-5xl text-red-500"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Configuration Error</h3>
            <p className="text-sm text-gray-600 mb-4">Stripe payment gateway is not configured. Please contact support.</p>
            <button
              onClick={onCancel}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Elements stripe={stripePromise}>
        <PaymentForm
          rideDetails={rideDetails}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

export default RidePaymentModal;
