"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import BackButton from "../components/BackButton"
import { SocketContext } from "../context/SocketContext"

const RideHistory = () => {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("completed") // all, completed, cancelled
  const [dateRange, setDateRange] = useState("1week")
  const navigate = useNavigate()
  const { socket } = useContext(SocketContext)

  useEffect(() => {
    fetchRideHistory()
  }, [filter, dateRange])

  // Listen for real-time status updates via socket
  useEffect(() => {
    if (!socket) return

    socket.on('ride-status-updated', (data) => {
      console.log('📢 Ride status updated:', data)
      
      // Update the ride in local state
      setRides(prevRides => 
        prevRides.map(ride => 
          ride._id === data.rideId 
            ? { ...ride, status: data.status } 
            : ride
        )
      )
      
      // Show toast notification
      toast.success(data.message || `Ride status updated to ${data.status}`, {
        duration: 4000,
        icon: data.status === 'completed' ? '✅' : '❌'
      })
    })

    return () => {
      socket.off('ride-status-updated')
    }
  }, [socket])

  const fetchRideHistory = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { filter, dateRange },
      })
      setRides(response.data.rides)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching ride history:", error)
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100"
      case "cancelled":
        return "text-red-600 bg-red-100"
      case "ongoing":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading ride history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            <BackButton />
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ride History</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">View your completed rides</p>
            </div>
          </div>

          {/* Filters - Matching Screenshot */}
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-2 border-gray-900 dark:border-gray-300 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Rides</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="ongoing">Ongoing</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1week">This Week</option>
              <option value="1month">This Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {rides.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No rides found for the selected criteria.</p>
            </div>
          ) : (
            rides.map((ride) => (
              <div key={ride._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{ride.pickup}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{ride.destination}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Passenger: {ride.user?.fullname?.firstname 
                          ? `${ride.user.fullname.firstname} ${ride.user.fullname.lastname || ''}`.trim()
                          : 'test'}
                      </span>
                      <span>•</span>
                      <span>{formatDate(ride.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{ride.fare}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(
                        ride.status
                      )}`}
                    >
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/home")}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default RideHistory
