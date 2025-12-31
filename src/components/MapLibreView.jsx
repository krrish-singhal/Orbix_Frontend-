import React, { useEffect, useRef, useMemo } from 'react';
import captainMarkerImg from '../assets/captain_marker.png';
import userMarkerImg from '../assets/user_marker.png';
import pickupMarkerImg from '../assets/pickup_marker.png';
import destinationMarkerImg from '../assets/destination_marker.png';

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY;

const STYLES = {
  streets: `https://tiles.locationiq.com/v3/vector/{z}/{x}/{y}.pbf?key=${LOCATIONIQ_KEY}&style=streets`,
  dark: `https://tiles.locationiq.com/v3/vector/{z}/{x}/{y}.pbf?key=${LOCATIONIQ_KEY}&style=dark`,
  satellite: `https://tiles.locationiq.com/v3/vector/{z}/{x}/{y}.pbf?key=${LOCATIONIQ_KEY}&style=satellite`,
};

function MapLibreView({
  captainLocation,
  userLocation,
  pickupLocation,
  destinationLocation,
  style = 'streets',
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const captainMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const routeLayerId = 'route-line';

  // Memoize locations
  const captainPos = useMemo(() => captainLocation ? [captainLocation.lng, captainLocation.lat] : null, [captainLocation]);
  const userPos = useMemo(() => userLocation ? [userLocation.lng, userLocation.lat] : null, [userLocation]);
  const pickupPos = useMemo(() => pickupLocation ? [pickupLocation.lng, pickupLocation.lat] : null, [pickupLocation]);
  const destinationPos = useMemo(() => destinationLocation ? [destinationLocation.lng, destinationLocation.lat] : null, [destinationLocation]);

  useEffect(() => {
    if (!LOCATIONIQ_KEY) return;
    if (!captainPos) return;
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    import('maplibre-gl').then(maplibregl => {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://tiles.locationiq.com/v3/streets/vector.json?key=${LOCATIONIQ_KEY}`,
        center: captainPos || userPos || pickupPos || destinationPos || [77.209, 28.6139], // fallback to Delhi
        zoom: 14,
      });
      mapRef.current = map;

      map.on('load', () => {
        // Add missing image handler to prevent sprite errors
        map.on('styleimagemissing', function(e) {
          const width = 1, height = 1;
          const data = new Uint8Array(width * height * 4);
          map.addImage(e.id, { width, height, data }, { pixelRatio: 1 });
        });
        // Add pickup marker
        if (pickupPos) {
          const el = document.createElement('img');
          el.src = pickupMarkerImg;
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          pickupMarkerRef.current = new maplibregl.Marker(el).setLngLat(pickupPos).addTo(map);
        }
        // Add destination marker
        if (destinationPos) {
          const el = document.createElement('img');
          el.src = destinationMarkerImg;
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          destinationMarkerRef.current = new maplibregl.Marker(el).setLngLat(destinationPos).addTo(map);
        }
        // Add captain marker
        if (captainPos) {
          const el = document.createElement('img');
          el.src = captainMarkerImg;
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          captainMarkerRef.current = new maplibregl.Marker(el).setLngLat(captainPos).addTo(map);
        }
        // Add user marker
        if (userPos) {
          const el = document.createElement('img');
          el.src = userMarkerImg;
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          userMarkerRef.current = new maplibregl.Marker(el).setLngLat(userPos).addTo(map);
        }
        // Fit bounds
        const bounds = new maplibregl.LngLatBounds();
        [pickupPos, destinationPos, captainPos, userPos].forEach(pos => {
          if (pos) bounds.extend(pos);
        });
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 60 });
        }
      });
    });
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [LOCATIONIQ_KEY, captainPos, userPos, captainMarkerImg, userMarkerImg, style]);

  // Move markers live
  useEffect(() => {
    if (captainMarkerRef.current && captainPos) {
      captainMarkerRef.current.setLngLat(captainPos);
    }
    if (userMarkerRef.current && userPos) {
      userMarkerRef.current.setLngLat(userPos);
    }
    if (pickupMarkerRef.current && pickupPos) {
      pickupMarkerRef.current.setLngLat(pickupPos);
    }
    if (destinationMarkerRef.current && destinationPos) {
      destinationMarkerRef.current.setLngLat(destinationPos);
    }
  }, [captainPos, userPos, pickupPos, destinationPos]);

  // Draw route polyline
  useEffect(() => {
    if (!LOCATIONIQ_KEY || !pickupPos || !destinationPos || !mapRef.current) return;
    const map = mapRef.current;
    // Remove old route
    if (map.getLayer(routeLayerId)) {
      map.removeLayer(routeLayerId);
    }
    if (map.getSource(routeLayerId)) {
      map.removeSource(routeLayerId);
    }
    // Fetch route
    fetch(`https://us1.locationiq.com/v1/directions/driving/${pickupPos.join(',')};${destinationPos.join(',')}?key=${LOCATIONIQ_KEY}&overview=full&geometries=geojson`)
      .then(res => res.json())
      .then(data => {
        if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
          map.addSource(routeLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: data.routes[0].geometry,
            },
          });
          map.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeLayerId,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#22c55e',
              'line-width': 4,
            },
          });
        }
      });
    return () => {
      if (map.getLayer(routeLayerId)) {
        map.removeLayer(routeLayerId);
      }
      if (map.getSource(routeLayerId)) {
        map.removeSource(routeLayerId);
      }
    };
  }, [pickupPos, destinationPos, LOCATIONIQ_KEY]);

  // Removed geolocation effect; location should be set by parent and passed as prop.

  if (!LOCATIONIQ_KEY) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-red-600 font-bold">
        LocationIQ API key missing
      </div>
    );
  }
  if (!captainLocation) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-600 font-semibold">
        Captain location unavailable
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full min-h-[300px] rounded-xl overflow-hidden" />
  );
}

export default React.memo(MapLibreView);
