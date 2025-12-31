"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

const CaptainVehicle = () => {
  const [vehicle, setVehicle] = useState({
    vehicleType: '',
    color: '',
    plate: '',
    capacity: '',
    model: '',
    year: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const navigate = useNavigate()

  const vehicleTypes = [
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
    { value: 'auto', label: 'Auto Rickshaw', icon: '🛺' }
  ]

  const colors = [
    'White', 'Black', 'Silver', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Brown', 'Other'
  ]

  useEffect(() => {
    fetchVehicleInfo()
  }, [])

  const fetchVehicleInfo = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captains/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      if (response.data.captain.vehicle) {
        setVehicle(response.data.captain.vehicle)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching vehicle info:", error)
      setLoading(false)
      toast.error("Error loading vehicle information")
    }
  }

  const handleInputChange = (field, value) => {
    setVehicle(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!vehicle.vehicleType || !vehicle.plate || !vehicle.color) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/captains/vehicle`,
        { vehicle },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      toast.success("Vehicle information updated successfully")
      setEditing(false)
    } catch (error) {
      console.error("Error updating vehicle:", error)
      toast.error("Error updating vehicle information")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    fetchVehicleInfo() // Reset to original data
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Information</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your vehicle details</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-sm font-medium transition-colors"
                  title="Edit Vehicle"
                >
                  <i className="ri-pencil-line text-lg"></i>
                </button>
              ) : (
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white w-24 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white w-24 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Vehicle Type *
              </label>
              {editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {vehicleTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('vehicleType', type.value)}
                      className={`px-6 py-3 border-2 rounded-lg text-center transition-colors ${
                        vehicle.vehicleType === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {vehicleTypes.find(t => t.value === vehicle.vehicleType)?.icon || '🚗'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {vehicleTypes.find(t => t.value === vehicle.vehicleType)?.label || 'Not specified'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* License Plate */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                License Plate Number *
              </label>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                  {vehicle.plate || 'Not specified'}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  License plate cannot be edited
                </p>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Vehicle Color *
              </label>
              {editing ? (
                <select
                  value={vehicle.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.color || 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Vehicle Model
              </label>
              {editing ? (
                <input
                  type="text"
                  value={vehicle.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Enter vehicle model (e.g., Honda City, Royal Enfield)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">
                    {vehicle.model || 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            {/* Year and Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Year
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={vehicle.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">
                      {vehicle.year || 'Not specified'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Seating Capacity
                </label>
                {editing ? (
                  <select
                    value={vehicle.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select capacity</option>
                    <option value="1">1 passenger</option>
                    <option value="2">2 passengers</option>
                    <option value="3">3 passengers</option>
                    <option value="4">4 passengers</option>
                    <option value="6">6 passengers</option>
                    <option value="8">8 passengers</option>
                  </select>
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">
                      {vehicle.capacity ? `${vehicle.capacity} passengers` : 'Not specified'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Required Fields Note */}
          {editing && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Fields marked with * are required for accepting rides.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your vehicle information is {vehicle.vehicleType && vehicle.plate && vehicle.color ? 'complete' : 'incomplete'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              vehicle.vehicleType && vehicle.plate && vehicle.color
                ? 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/20'
                : 'text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/20'
            }`}>
              {vehicle.vehicleType && vehicle.plate && vehicle.color ? 'Verified' : 'Pending'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaptainVehicle