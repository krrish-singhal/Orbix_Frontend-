"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"
import axios from "axios"
import toast from "react-hot-toast"

const ProfileSettings = () => {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data.user)
      setFormData({
        firstname: response.data.user.fullname.firstname,
        lastname: response.data.user.fullname.lastname,
        email: response.data.user.email,
        phone: response.data.user.phone || "",
      })
    } catch (error) {
      toast.error("Failed to fetch profile")
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      // Only send allowed fields (excluding email)
      const updateData = {
        fullname: {
          firstname: formData.firstname,
          lastname: formData.lastname
        },
        phone: formData.phone
      }
      
      await axios.patch(`${import.meta.env.VITE_BASE_URL}/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      toast.success("Profile updated successfully")
      setIsEditing(false)
      fetchUserProfile()
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-2xl">
                {formData.firstname.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
              {formData.firstname} {formData.lastname}
            </h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstname}
                onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-dark-card dark:text-dark-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastname}
                onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-dark-card dark:text-dark-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled={true}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed for security reasons
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-dark-card dark:text-dark-text"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    fetchUserProfile() // Reset form
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings