// Utility functions for map operations
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const calculateETA = (distance, averageSpeed = 30) => {
  // distance in km, speed in km/h, returns minutes
  return Math.round((distance / averageSpeed) * 60)
}

export const geocodeAddress = async (address) => {
  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(address)}&format=json&limit=1`,
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
        display_name: data[0].display_name,
      }
    }
    return null
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}

export const reverseGeocode = async (lat, lng) => {
  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`,
    )
    const data = await response.json()
    return data.display_name || `${lat}, ${lng}`
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return `${lat}, ${lng}`
  }
}

export const getRoute = async (startLat, startLng, endLat, endLng) => {
  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/directions/driving/${startLng},${startLat};${endLng},${endLat}?key=${LOCATIONIQ_KEY}&steps=true&geometries=geojson`,
    )
    const data = await response.json()

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      return {
        coordinates: route.geometry.coordinates,
        distance: route.distance / 1000, // Convert to km
        duration: route.duration / 60, // Convert to minutes
        steps: route.legs[0].steps,
      }
    }
    return null
  } catch (error) {
    console.error("Routing error:", error)
    return null
  }
}

// Returns the vehicle image URL based on vehicleType
export const getVehicleImage = (vehicleType) => {
  if (vehicleType === "car") {
    return "https://tse4.mm.bing.net/th/id/OIP.ymjpxr4RPlwbLenCbbpYywHaE7?rs=1&pid=ImgDetMain&o=7&rm=3";
  } else if (vehicleType === "moto") {
    return "https://static.vecteezy.com/system/resources/previews/045/840/640/non_2x/food-delivery-man-riding-scooter-vector.jpg";
  } else {
    return "https://i.pinimg.com/originals/2c/5e/14/2c5e1485755e664bcf7614cc4d492003.png";
  }
}
