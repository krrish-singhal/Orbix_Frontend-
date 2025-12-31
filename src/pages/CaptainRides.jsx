"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import BackButton from "../components/BackButton"
import { SocketContext } from "../context/SocketContext"

const CaptainRides = () => {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('week')
  const [updatingRide, setUpdatingRide] = useState(null)
  const navigate = useNavigate()
  const { socket } = useContext(SocketContext)

  // Mock data for development
  const mockRides = [
    {
      id: 1,
      pickup: "Downtown Mall",
      destination: "Airport Terminal",
      passenger: "John Doe",
      fare: 25.50,
      status: "completed",
      date: "2024-01-15",
      rating: 4.8
    },
    {
      id: 2,
      pickup: "City Center",
      destination: "University Campus",
      passenger: "Jane Smith",
      fare: 15.75,
      status: "completed",
      date: "2024-01-14",
      rating: 5.0
    }
  ]

  useEffect(() => {
    fetchRides()
  }, [filter, timeRange])

  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/captain/history?filter=${filter}&range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      setRides(response.data.rides || mockRides)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching rides:", error)
      setRides(mockRides) // Fallback to mock data
      setLoading(false)
      toast.error("Error loading rides history")
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const updateRideStatus = async (rideId, newStatus) => {
    try {
      setUpdatingRide(rideId)
      const token = localStorage.getItem("token")
      
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/rides/captain/update-status/${rideId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      if (response.data.success) {
        // Update local state
        setRides(rides.map(ride => 
          ride._id === rideId ? { ...ride, status: newStatus } : ride
        ))
        
        toast.success(`Ride ${newStatus === 'completed' ? 'completed' : 'cancelled'} successfully`)
        
        // Refresh rides list
        fetchRides()
      }
    } catch (error) {
      console.error("Error updating ride status:", error)
      toast.error(error.response?.data?.message || "Failed to update ride status")
    } finally {
      setUpdatingRide(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      case 'ongoing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ride History</h1>
              <p className="text-gray-600 dark:text-gray-400">View your completed rides</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Rides</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {rides.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No rides found</h3>
              <p className="text-gray-600 dark:text-gray-400">You haven't completed any rides yet.</p>
            </div>
          ) : (
            rides.map((ride) => (
              <div key={ride._id || ride.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {ride.pickup}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          {ride.destination}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span>Passenger: {ride.user?.fullname?.firstname || ride.passenger || 'N/A'}</span>
                      <span>•</span>
                      <span>{formatDate(ride.createdAt || ride.date)}</span>
                      {ride.rating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                            </svg>
                            <span>{ride.rating}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ₹{ride.fare}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </div>
                      </div>
                      
                      {/* Status Change Buttons - Only show for ongoing rides */}
                      {ride.status === 'ongoing' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateRideStatus(ride._id || ride.id, 'completed')}
                            disabled={updatingRide === (ride._id || ride.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {updatingRide === (ride._id || ride.id) ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <i className="ri-check-line"></i>
                                Complete
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => updateRideStatus(ride._id || ride.id, 'cancelled')}
                            disabled={updatingRide === (ride._id || ride.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {updatingRide === (ride._id || ride.id) ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <i className="ri-close-line"></i>
                                Cancel
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistics Summary */}
        {rides.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {rides.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Rides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${rides.reduce((sum, ride) => sum + ride.fare, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {rides.filter(ride => ride.rating).length > 0 
                    ? (rides.filter(ride => ride.rating).reduce((sum, ride) => sum + ride.rating, 0) / rides.filter(ride => ride.rating).length).toFixed(1)
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Rating</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CaptainRides