"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { CaptainDataContext } from "../context/CaptainContext"

const CaptainProfile = () => {
  const { captain: contextCaptain, setCaptain: setContextCaptain } = useContext(CaptainDataContext)
  const [captain, setCaptain] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/captains/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      setCaptain(response.data.captain)
      setContextCaptain(response.data.captain) // Update context
      setProfileImage(response.data.captain.profileImage || null)
      setImagePreview(response.data.captain.profileImage || null)
      setFormData({
        firstname: response.data.captain.fullname?.firstname || '',
        lastname: response.data.captain.fullname?.lastname || '',
        email: response.data.captain.email || '',
        phone: response.data.captain.phone || ''
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/captains/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success("Profile updated successfully")
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData({
      firstname: captain?.fullname?.firstname || '',
      lastname: captain?.fullname?.lastname || '',
      email: captain?.email || '',
      phone: captain?.phone || ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!profileImage || typeof profileImage === 'string') {
      toast.error('Please select an image first')
      return
    }
    
    try {
      setUploadingImage(true)
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('profileImage', profileImage)
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/upload-profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      // Update context immediately with new image
      if (response.data.profileImage) {
        setContextCaptain(prev => ({
          ...prev,
          profileImage: response.data.profileImage
        }))
      }
      
      toast.success('Profile image updated successfully')
      fetchProfile()
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <i className="ri-arrow-left-line text-xl text-gray-600 dark:text-gray-300"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Captain Profile</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your profile information</p>
              </div>
            </div>
            {!editing ? (
              <button
                onClick={handleEdit}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors"
                title="Edit Profile"
              >
                <i className="ri-pencil-line text-lg"></i>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Information */}
        {captain && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                  />
                ) : (
                  <div className="w-24 h-24 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center border-4 border-green-500">
                    <span className="text-white font-bold text-4xl">
                      {(captain.fullname?.firstname?.[0] || 'C').toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Camera Icon */}
                <label
                  htmlFor="profile-image-input"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors"
                  title="Change profile picture"
                >
                  <i className="ri-camera-line text-white text-sm"></i>
                </label>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Upload Button - Show if new image selected */}
            {profileImage && typeof profileImage !== 'string' && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {uploadingImage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="ri-upload-2-line"></i>
                      Upload Image
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Profile Fields */}
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">{captain.fullname?.firstname || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-900 dark:text-white">{captain.fullname?.lastname || 'Not specified'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Email
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-white">{captain.email || 'Not specified'}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="flex text-sm font-medium text-gray-900 dark:text-white mb-2 items-center gap-2">
                  Phone
                  {!editing && !captain.phone && (
                    <button
                      className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
                      title="Add phone number"
                      onClick={() => setEditing(true)}
                    >
                      <i className="ri-add-line text-lg align-middle"></i>
                    </button>
                  )}
                </label>
                {editing && !captain.phone ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white">{captain.phone || 'Not specified'}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {captain.phone ? 'Phone cannot be changed' : 'Add your phone number'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CaptainProfile