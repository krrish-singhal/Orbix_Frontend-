"use client"

import React, { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const RatingModal = ({ isOpen, onClose, rideData, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleStarClick = (starRating) => {
    setRating(starRating)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/rate`,
        {
          rideId: rideData._id,
          rating,
          review: review.trim() || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      toast.success("Thank you for rating!")
      onRatingSubmitted && onRatingSubmitted(rating, review)
      onClose()
    } catch (error) {
      toast.error("Failed to submit rating")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return "Poor"
      case 2: return "Fair"  
      case 3: return "Good"
      case 4: return "Very Good"
      case 5: return "Excellent"
      default: return "Rate your experience"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Trip Completed!
          </h2>
          <p className="text-gray-600">
            How was your ride with {rideData?.captain?.fullname?.firstname}?
          </p>
        </div>

        {/* Captain Info */}
        <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold">
              {rideData?.captain?.fullname?.firstname?.charAt(0) || 'C'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              {rideData?.captain?.fullname?.firstname} {rideData?.captain?.fullname?.lastname}
            </h3>
            <p className="text-sm text-gray-600">
              {rideData?.captain?.vehicle?.vehicleType} • {rideData?.captain?.vehicle?.plate}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">₹{rideData?.fare}</p>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            {getRatingText(rating)}
          </h3>
          <div className="flex justify-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="text-3xl transition-colors duration-200"
              >
                <i 
                  className={`ri-star-${star <= rating ? 'fill' : 'line'} ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                ></i>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Tap to rate</p>
        </div>

        {/* Review Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a comment (optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">{review.length}/200</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Rating'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingModal