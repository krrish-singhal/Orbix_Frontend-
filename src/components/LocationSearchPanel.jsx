"use client"

const LocationSearchPanel = ({ suggestions = [], setPickup, setDestination, activeField, onSuggestionClick }) => {
  // Ensure suggestions is always an array
  const validSuggestions = Array.isArray(suggestions) ? suggestions : []

  const handleClick = (location) => {
    if (onSuggestionClick) {
      onSuggestionClick(location)
    } else if (activeField === "pickup") {
      setPickup(location)
    } else {
      setDestination(location)
    }
  }

  return (
    <div className="p-4 pt-20 sm:pt-24">
      {validSuggestions.length > 0 ? (
        validSuggestions.map((loc, index) => (
          <div
            key={index}
            onClick={() => handleClick(loc)}
            className="flex gap-3 sm:gap-4 items-center my-2 cursor-pointer hover:bg-gray-100 p-2 sm:p-3 rounded-xl transition-all"
          >
            <div className="bg-[#eee] h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full">
              <i className="ri-map-pin-line text-gray-600 text-sm sm:text-lg"></i>
            </div>
            <h4 className="font-medium text-gray-800 text-xs sm:text-sm">{loc}</h4>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-6 sm:py-8">
          <i className="ri-map-pin-line text-2xl sm:text-3xl mb-2"></i>
          <p className="text-sm sm:text-base">Type at least 2 characters to search</p>
          <p className="text-xs sm:text-sm mt-1">Real-time suggestions will appear here</p>
        </div>
      )}
    </div>
  )
}

export default LocationSearchPanel
