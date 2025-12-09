/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';

interface HistoryEntry {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  history?: HistoryEntry[];
  selectedHistoryEntry?: HistoryEntry | null;
  onMapLoad?: (map: google.maps.Map) => void;
}

declare global {
  interface Window {
    initMap: () => void;
    google?: typeof google;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  latitude, 
  longitude, 
  history = [],
  selectedHistoryEntry,
  onMapLoad 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [historyMarkers, setHistoryMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDdTA5OvxyVoCfGCMY-uL3xqj8QN3t8qOk&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      window.initMap = initializeMap;
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapStyles = [
        { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#4a90a4' }] },
        { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1a3a4a' }] },
        { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#3a8a9a' }] },
        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#0f1a20' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a2a35' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#00d4ff' }] },
        { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#0a2020' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a3545' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d2030' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a4a5a' }] },
        { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a3a4a' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a2535' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#051525' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#00a0c0' }] }
      ];

      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 14,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(newMap);
      onMapLoad?.(newMap);
    };

    loadGoogleMaps();

    return () => {
      if (marker) marker.setMap(null);
      if (polyline) polyline.setMap(null);
      historyMarkers.forEach(m => m.setMap(null));
    };
  }, []);

  // Update current position marker
  useEffect(() => {
    if (!map) return;

    const position = { lat: latitude, lng: longitude };

    if (marker) marker.setMap(null);

    const markerSvg = `
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00ffff" stop-opacity="0.8"/>
            <stop offset="50%" stop-color="#00ffff" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#00ffff" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="marker-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00ffff"/>
            <stop offset="50%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="28" fill="url(#glow)"/>
        <circle cx="30" cy="30" r="12" fill="url(#marker-gradient)" stroke="#ffffff" stroke-width="2"/>
        <circle cx="30" cy="30" r="5" fill="#ffffff"/>
      </svg>
    `;

    const newMarker = new google.maps.Marker({
      position,
      map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
        scaledSize: new google.maps.Size(60, 60),
        anchor: new google.maps.Point(30, 30),
      },
      animation: google.maps.Animation.DROP,
      zIndex: 1000,
    });

    setMarker(newMarker);
    
    if (!selectedHistoryEntry) {
      map.panTo(position);
    }
  }, [map, latitude, longitude]);

  // Draw history trail polyline
  useEffect(() => {
    if (!map || history.length < 2) return;

    if (polyline) polyline.setMap(null);
    historyMarkers.forEach(m => m.setMap(null));

    // Sort history by timestamp (oldest first for the path)
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
    const path = sortedHistory.map(entry => ({
      lat: entry.latitude,
      lng: entry.longitude,
    }));

    // Create gradient polyline
    const newPolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#00ffff',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          strokeColor: '#a855f7',
          fillColor: '#a855f7',
          fillOpacity: 1,
        },
        offset: '100%',
        repeat: '100px',
      }],
    });

    setPolyline(newPolyline);

    // Add small markers for history points
    const smallMarkerSvg = `
      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6" fill="#00ffff" fill-opacity="0.3" stroke="#00ffff" stroke-width="1"/>
        <circle cx="8" cy="8" r="3" fill="#00ffff"/>
      </svg>
    `;

    const newHistoryMarkers = sortedHistory.slice(0, -1).map((entry, index) => {
      return new google.maps.Marker({
        position: { lat: entry.latitude, lng: entry.longitude },
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(smallMarkerSvg),
          scaledSize: new google.maps.Size(16, 16),
          anchor: new google.maps.Point(8, 8),
        },
        zIndex: index,
      });
    });

    setHistoryMarkers(newHistoryMarkers);

    return () => {
      newPolyline.setMap(null);
      newHistoryMarkers.forEach(m => m.setMap(null));
    };
  }, [map, history]);

  // Pan to selected history entry
  useEffect(() => {
    if (!map || !selectedHistoryEntry) return;
    
    map.panTo({
      lat: selectedHistoryEntry.latitude,
      lng: selectedHistoryEntry.longitude,
    });
    map.setZoom(16);
  }, [map, selectedHistoryEntry]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
      <div className="absolute inset-0 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
      </div>
      {/* Trail legend */}
      {history.length > 1 && (
        <div className="absolute bottom-4 left-4 glass-panel px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full" />
          <span className="text-xs text-muted-foreground">Movement Trail</span>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
