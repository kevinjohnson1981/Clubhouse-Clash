import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './MapboxMap.css';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = mapboxToken || '';

const DEFAULT_MAP_CENTER = { lat: 39.8283, lng: -98.5795 };

function MapboxDistanceMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userLocationRef = useRef(null); // ✅ useRef for guaranteed access
  const [distance, setDistance] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const metersToYards = (m) => (m * 1.09361).toFixed(0);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  let animationMarker;
let animationFrame;

function animateBall(map, lineCoords) {
  let progress = 0;

  if (animationMarker) {
    animationMarker.remove();
    cancelAnimationFrame(animationFrame);
  }

  const el = document.createElement('div');
  el.innerHTML = '⚪'; // You can use '⛳' or style this later
  el.style.fontSize = '7px';

  animationMarker = new mapboxgl.Marker({ element: el })
    .setLngLat(lineCoords[0])
    .addTo(map);

  function step() {
    progress += 0.01;
    if (progress > 1) progress = 0;

    const start = lineCoords[0];
    const end = lineCoords[1];
    const lng = start[0] + (end[0] - start[0]) * progress;
    const lat = start[1] + (end[1] - start[1]) * progress;

    animationMarker.setLngLat([lng, lat]);
    animationFrame = requestAnimationFrame(step);
  }

  step();
}

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!mapboxToken) {
      console.error("Missing VITE_MAPBOX_TOKEN for MapboxDistanceMap.");
      setLocationMessage("Map token is missing.");
      return;
    }

    const ensureMapResized = () => {
      requestAnimationFrame(() => {
        map.current?.resize();
        setTimeout(() => map.current?.resize(), 250);
      });
    };

    const attachMapInteractions = () => {
      if (!map.current || map.current._distanceClickHandlerAttached) return;

      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        console.log("🧭 Clicked at:", lat, lng);

        if (!userLocationRef.current) return;

        const distMeters = calculateDistance(
          userLocationRef.current.lat,
          userLocationRef.current.lng,
          lat,
          lng
        );
        const distYards = metersToYards(distMeters);
        setDistance(distYards);

        if (map.current._clickMarker) {
          map.current._clickMarker.remove();
        }

        const el = document.createElement('div');
        el.innerHTML = 'o';
        el.style.fontSize = '20px';
        el.style.color = 'red';
        el.style.fontWeight = 'bold';
        el.style.textShadow = '0 0 3px white';

        const redMarker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current);

        map.current._clickMarker = redMarker;

        const lineCoords = [
          [userLocationRef.current.lng, userLocationRef.current.lat],
          [lng, lat]
        ];

        const lineId = 'distance-line';

        if (map.current.getSource(lineId)) {
          map.current.removeLayer(lineId);
          map.current.removeSource(lineId);
        }

        map.current.addSource(lineId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: lineCoords
            }
          }
        });

        map.current.addLayer({
          id: lineId,
          type: 'line',
          source: lineId,
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': 'red',
            'line-width': 5,
            'line-blur': 3,
            'line-opacity': 1.0,
          }
        });

        animateBall(map.current, lineCoords);
      });

      map.current._distanceClickHandlerAttached = true;
    };

    const initializeMap = ({ lat, lng }, zoomLevel = 17) => {
      if (map.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [lng, lat],
        zoom: zoomLevel,
      });

      map.current.on('load', ensureMapResized);
      ensureMapResized();
      attachMapInteractions();
    };

    const updateUserLocation = ({ lat, lng }) => {
      userLocationRef.current = { lat, lng };
      setLocationMessage("");

      if (!map.current) {
        initializeMap({ lat, lng }, 17);
      } else {
        map.current.flyTo({ center: [lng, lat], zoom: 17, essential: true });
      }

      if (!map.current._userMarker) {
        map.current._userMarker = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([lng, lat])
          .addTo(map.current);
      } else {
        map.current._userMarker.setLngLat([lng, lat]);
      }
    };

    initializeMap(DEFAULT_MAP_CENTER, 3.4);

    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported on this device.");
      return () => {
        if (animationMarker) animationMarker.remove();
        cancelAnimationFrame(animationFrame);
        map.current?.remove();
        map.current = null;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Geolocation error in MapboxDistanceMap:", error);
        setLocationMessage("Allow location access to center the GPS map on your position.");
        ensureMapResized();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    return () => {
      if (animationMarker) animationMarker.remove();
      cancelAnimationFrame(animationFrame);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      {locationMessage && (
        <p className="map-helper-text">{locationMessage}</p>
      )}
      {distance && (
        <p style={{ marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>
          📏 Distance to point: {distance} yards
        </p>
      )}
    </div>
  );
}

export default MapboxDistanceMap;
