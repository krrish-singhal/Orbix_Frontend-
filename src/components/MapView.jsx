import React from "react";
import MapLibreView from './MapLibreView'

export default function MapView({ captainLocation, userLocation, captainMarker, userMarker, className = "" }) {
  return (
    <div className={`w-full h-full min-h-[400px] lg:min-h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 ${className}`}>
      <MapLibreView
        captainLocation={captainLocation}
        userLocation={userLocation}
        captainMarker={captainMarker}
        userMarker={userMarker}
      />
    </div>
  );
}
