import React, { useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';

// Initialize Stripe (you'll add your publishable key in .env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
          card: elements.getElement(CardElement),
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
        // Send email receipt
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

        toast.success('Payment successful! Receipt sent to your email.');
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
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
      
      // Process UPI payment (as per your existing logic)
      await axios.post(
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

      // Send email receipt
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

      toast.success('Payment successful! Receipt sent to your email.');
      onSuccess();
    } catch (error) {
      console.error('UPI Payment error:', error);
      toast.error('Payment failed. Please try again.');
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
    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>

      {/* Ride Details Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Ride Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">From:</span>
            <span className="text-gray-800 font-medium text-right max-w-[200px] truncate">{rideDetails.pickup}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To:</span>
            <span className="text-gray-800 font-medium text-right max-w-[200px] truncate">{rideDetails.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Distance:</span>
            <span className="text-gray-800 font-medium">{rideDetails.distance}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-semibold">Total Amount:</span>
            <span className="text-green-600 font-bold text-lg">₹{rideDetails.fare}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
            className={`p-3 rounded-lg border-2 transition-all ${
              formData.paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <i className="ri-bank-card-line text-2xl mb-1"></i>
            <p className="text-sm font-medium">Credit Card</p>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
            className={`p-3 rounded-lg border-2 transition-all ${
              formData.paymentMethod === 'upi'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <i className="ri-smartphone-line text-2xl mb-1"></i>
            <p className="text-sm font-medium">UPI</p>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={formData.paymentMethod === 'card' ? handleCardPayment : handleUPIPayment}>
        {/* Personal Information */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Receipt will be sent to this email</p>
          </div>
        </div>

        {/* Card Details (only for card payment) */}
        {formData.paymentMethod === 'card' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
            <div className="border border-gray-300 rounded-lg p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        )}

        {/* UPI Instructions (only for UPI payment) */}
        {formData.paymentMethod === 'upi' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <i className="ri-information-line text-blue-600 mt-0.5"></i>
              <div className="text-sm text-blue-800">
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
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
