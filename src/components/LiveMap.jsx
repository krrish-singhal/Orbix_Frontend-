import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const LiveMap = ({
  userLocation,
  captainLocation,
  pickupLocation,
  destinationLocation,
  endLocation,
  routeCoordinates = [],
  showRoute = false,
  markerType = "captain", // Default marker is captain, but can be "user"
  onMapLoad,
  className = "w-full h-full",
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef([]);

  // LocationIQ API key from environment
  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY || "pk.locationiq.com";

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://tiles.locationiq.com/v3/streets/vector.json?key=${LOCATIONIQ_KEY}`,
      center: userLocation
        ? [userLocation.lng, userLocation.lat]
        : [77.209, 28.6139], // Default to Delhi
      zoom: 17, // High zoom for street-level accuracy
      attributionControl: false,
    });

    // Disable scroll-to-zoom so the page can scroll smoothly when user
    // scrolls over the map. Zoom still possible via controls or pinch.
    try {
      if (map.current && map.current.scrollZoom && typeof map.current.scrollZoom.disable === 'function') {
        map.current.scrollZoom.disable();
      }
    } catch (e) {
      // ignore if scrollZoom control is not available
    }

    map.current.on("load", () => {
      setMapLoaded(true);
      if (onMapLoad) onMapLoad(map.current);
    });

    map.current.on("error", (e) => {});

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    clearMarkers();

    // Main location marker (captain or user)
    let mainMarker = null;
    if (markerType === "captain" && captainLocation) {
      // Captain style: yellow
      mainMarker = new maplibregl.Marker({
        color: "#FFD600", // Orbix Yellow
        scale: 1.4,
      })
        .setLngLat([captainLocation.lng, captainLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="font-bold text-yellow-600">Captain Location</div>'))
        .addTo(map.current);
    } else if (markerType === "user" && userLocation) {
      // User style: blue
      mainMarker = new maplibregl.Marker({
        color: "#2563EB", // Blue
        scale: 1.4,
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="font-bold text-blue-600">Your Location</div>'))
        .addTo(map.current);
    }
    if (mainMarker) markersRef.current.push(mainMarker);

    // Optional: show both captain and user markers for tracking
    if (markerType === "captain" && userLocation) {
      const userMarker = new maplibregl.Marker({
        color: "#2563EB", // Blue
        scale: 1.1,
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">User Location</div>'))
        .addTo(map.current);
      markersRef.current.push(userMarker);
    }
    if (markerType === "user" && captainLocation) {
      const captainMarker = new maplibregl.Marker({
        color: "#FFD600", // Yellow
        scale: 1.1,
      })
        .setLngLat([captainLocation.lng, captainLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">Captain Location</div>'))
        .addTo(map.current);
      markersRef.current.push(captainMarker);
    }
    // Pickup marker
    if (pickupLocation) {
      const pickupMarker = new maplibregl.Marker({
        color: "#F59E0B", // Orange
        scale: 1.1,
      })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">Pickup Location</div>'))
        .addTo(map.current);
      markersRef.current.push(pickupMarker);
    }

    // Destination marker
    if (destinationLocation) {
      const destMarker = new maplibregl.Marker({
        color: "#EF4444", // Red
        scale: 1.1,
      })
        .setLngLat([destinationLocation.lng, destinationLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">Destination</div>'))
        .addTo(map.current);
      markersRef.current.push(destMarker);
    }

    // End location marker (show where ride ended)
    if (endLocation) {
      const endMarker = new maplibregl.Marker({
        color: "#8B5CF6", // Purple to indicate end
        scale: 1.2,
      })
        .setLngLat([endLocation.lng, endLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="font-semibold">Ride Ended Here</div>'))
        .addTo(map.current);
      markersRef.current.push(endMarker);
    }

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getLngLat());
      });
      
      // For ride view (pickup + destination), use tighter bounds
      const isRideView = pickupLocation && destinationLocation;
      map.current.fitBounds(bounds, { 
        padding: isRideView ? 60 : 80,
        maxZoom: isRideView ? 17 : 16, // Higher zoom for ride view
        duration: 1000 // Smooth animation
      });
    }
  }, [
    mapLoaded,
    userLocation,
    captainLocation,
    pickupLocation,
    destinationLocation,
    markerType,
  ]);

  // Add route line
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing route if any
    if (map.current.getSource("route")) {
      if (map.current.getLayer("route")) map.current.removeLayer("route");
      map.current.removeSource("route");
    }

    // Add new route if showRoute and enough points
    if (showRoute && routeCoordinates.length >= 2) {
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#326cf8", // Orbix blue (matches user map)
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    }
  }, [mapLoaded, showRoute, routeCoordinates]);

  return (
    <div className={className}>
      {/* touchAction allows vertical page panning while preventing map wheel-zoom
          from intercepting scroll gestures on desktop/mobile. */}
      <div ref={mapContainer} className="w-full h-full rounded-xl" style={{ touchAction: 'pan-y' }} />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
