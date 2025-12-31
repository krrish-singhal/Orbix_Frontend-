"use client"

import { useState, useEffect } from "react"

const LocationPermission = ({ onLocationGranted, onLocationDenied }) => {
  const [permissionStatus, setPermissionStatus] = useState("prompt")
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    // Check current permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state)
        if (result.state === 'granted') {
          requestLocation()
        }
      })
    }
  }, [])

  const requestLocation = async () => {
    setIsRequesting(true)

    if (!navigator.geolocation) {
      setPermissionStatus("unsupported")
      onLocationDenied?.("Geolocation is not supported by this browser")
      setIsRequesting(false)
      return
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }

      setPermissionStatus("granted")
      onLocationGranted?.(location)
    } catch (error) {
      console.error("Location error:", error)
      setPermissionStatus("denied")
      
      let errorMessage = "Unable to get your location"
      if (error.code === 1) {
        errorMessage = "Location permission denied"
      } else if (error.code === 2) {
        errorMessage = "Location information unavailable"
      } else if (error.code === 3) {
        errorMessage = "Location request timeout"
      }
      
      onLocationDenied?.(errorMessage)
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case "granted":
        return (
          <svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case "denied":
        return (
          <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        )
      case "unsupported":
        return (
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
    }
  }

  const getStatusMessage = () => {
    switch (permissionStatus) {
      case "granted":
        return {
          title: "Location Access Granted",
          message: "We can now show you nearby rides and provide accurate pickup locations.",
          buttonText: null
        }
      case "denied":
        return {
          title: "Location Access Denied",
          message: "To use Orbix effectively, please enable location access in your browser settings.",
          buttonText: "Try Again"
        }
      case "unsupported":
        return {
          title: "Location Not Supported",
          message: "Your browser doesn't support location services. Please use a modern browser.",
          buttonText: null
        }
      default:
        return {
          title: "Enable Location Access",
          message: "Orbix needs access to your location to find nearby rides and provide accurate pickup points.",
          buttonText: isRequesting ? "Getting Location..." : "Allow Location Access"
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {getStatusIcon()}
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {statusInfo.title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {statusInfo.message}
        </p>

        {statusInfo.buttonText && (
          <button
            onClick={requestLocation}
            disabled={isRequesting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Getting Location...
              </>
            ) : (
              statusInfo.buttonText
            )}
          </button>
        )}

        {permissionStatus === "denied" && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Manual Setup:</strong> Click the location icon in your browser's address bar and select "Allow" for this site.
            </p>
          </div>
        )}

        {permissionStatus === "granted" && (
          <div className="mt-6 flex items-center justify-center text-sm text-green-600 dark:text-green-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Location access enabled
          </div>
        )}
      </div>
    </div>
  )
}

export default LocationPermission
