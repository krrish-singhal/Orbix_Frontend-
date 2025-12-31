"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

const CaptainSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      rideRequests: true,
      earnings: true,
      promotions: false,
      updates: true
    },
    preferences: {
      autoAccept: false,
      maxDistance: 10,
      workingHours: {
        start: '06:00',
        end: '22:00'
      }
    },
    privacy: {
      shareLocation: true,
      showRating: true
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captains/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      if (response.data.settings) {
        setSettings(response.data.settings)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching settings:", error)
      setLoading(false)
      toast.error("Error loading settings")
    }
  }

  const updateSettings = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/captains/settings`,
        { settings },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("Error updating settings")
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const handlePreferenceChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const handleWorkingHoursChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        workingHours: {
          ...prev.preferences.workingHours,
          [type]: value
        }
      }
    }))
  }

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }))
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your preferences and notifications</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Ride Requests</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">Get notified of new ride requests</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.rideRequests}
                onChange={(e) => handleNotificationChange('rideRequests', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Earnings Updates</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">Daily and weekly earnings summaries</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.earnings}
                onChange={(e) => handleNotificationChange('earnings', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Promotions</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">Special offers and bonuses</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.promotions}
                onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">App Updates</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">New features and improvements</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.updates}
                onChange={(e) => handleNotificationChange('updates', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ride Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Auto Accept Rides</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">Automatically accept rides within your preferences</p>
              </div>
              <input
                type="checkbox"
                checked={settings.preferences.autoAccept}
                onChange={(e) => handlePreferenceChange('autoAccept', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Maximum Distance (km)
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={settings.preferences.maxDistance}
                onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>1 km</span>
                <span className="font-medium">{settings.preferences.maxDistance} km</span>
                <span>50 km</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Working Hours
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={settings.preferences.workingHours.start}
                    onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={settings.preferences.workingHours.end}
                    onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Share Location</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">Allow passengers to see your location during rides</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.shareLocation}
                onChange={(e) => handlePrivacyChange('shareLocation', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Show Rating</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">Display your rating to passengers</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showRating}
                onChange={(e) => handlePrivacyChange('showRating', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <button
            onClick={updateSettings}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CaptainSettings