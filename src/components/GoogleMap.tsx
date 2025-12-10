/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Box, RotateCcw, Maximize2, Mountain } from 'lucide-react';

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
  isGpsActive?: boolean;
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
  isGpsActive = true,
  onMapLoad 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const [historyMarkers, setHistoryMarkers] = useState<google.maps.Marker[]>([]);
  const [is3D, setIs3D] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const rotationRef = useRef<number | null>(null);

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
        zoom: 17,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        tilt: 60, // Enable 3D tilt
        heading: 0,
        mapTypeId: 'roadmap',
        rotateControl: true,
      });

      setMap(newMap);
      onMapLoad?.(newMap);
    };

    loadGoogleMaps();

    return () => {
      if (marker) marker.setMap(null);
      if (polyline) polyline.setMap(null);
      historyMarkers.forEach(m => m.setMap(null));
      if (rotationRef.current) cancelAnimationFrame(rotationRef.current);
    };
  }, []);

  // Handle 3D toggle
  useEffect(() => {
    if (!map) return;
    
    if (is3D) {
      map.setTilt(60);
      map.setZoom(Math.max(map.getZoom() || 17, 16));
    } else {
      map.setTilt(0);
      map.setHeading(0);
    }
  }, [map, is3D]);

  // Handle auto-rotation
  useEffect(() => {
    if (!map || !isRotating) {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
        rotationRef.current = null;
      }
      return;
    }

    const rotate = () => {
      const currentHeading = map.getHeading() || 0;
      map.setHeading(currentHeading + 0.3);
      rotationRef.current = requestAnimationFrame(rotate);
    };

    rotationRef.current = requestAnimationFrame(rotate);

    return () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
      }
    };
  }, [map, isRotating]);

  // Update current position marker based on GPS status
  useEffect(() => {
    if (!map) return;

    // If GPS is not active, hide the marker
    if (!isGpsActive) {
      if (marker) {
        marker.setMap(null);
        setMarker(null);
      }
      return;
    }

    const position = { lat: latitude, lng: longitude };

    if (marker) marker.setMap(null);

    const markerSvg = `
      <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow3d" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00ffff" stop-opacity="1"/>
            <stop offset="30%" stop-color="#00ffff" stop-opacity="0.6"/>
            <stop offset="60%" stop-color="#a855f7" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="marker-gradient-3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00ffff"/>
            <stop offset="50%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx="40" cy="40" r="35" fill="url(#glow3d)"/>
        <circle cx="40" cy="40" r="18" fill="url(#marker-gradient-3d)" stroke="#ffffff" stroke-width="3" filter="url(#neon-glow)"/>
        <circle cx="40" cy="40" r="8" fill="#ffffff"/>
        <circle cx="40" cy="40" r="4" fill="#00ffff"/>
      </svg>
    `;

    const newMarker = new google.maps.Marker({
      position,
      map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(markerSvg),
        scaledSize: new google.maps.Size(80, 80),
        anchor: new google.maps.Point(40, 40),
      },
      animation: google.maps.Animation.DROP,
      zIndex: 1000,
    });

    setMarker(newMarker);
    
    if (!selectedHistoryEntry) {
      map.panTo(position);
    }
  }, [map, latitude, longitude, isGpsActive]);

  // Draw history trail polyline
  useEffect(() => {
    if (!map || history.length < 2) return;

    if (polyline) polyline.setMap(null);
    historyMarkers.forEach(m => m.setMap(null));

    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
    const path = sortedHistory.map(entry => ({
      lat: entry.latitude,
      lng: entry.longitude,
    }));

    const newPolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#00ffff',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4,
          strokeColor: '#a855f7',
          fillColor: '#a855f7',
          fillOpacity: 1,
        },
        offset: '100%',
        repeat: '80px',
      }],
    });

    setPolyline(newPolyline);

    const smallMarkerSvg = `
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="#00ffff" fill-opacity="0.2" stroke="#00ffff" stroke-width="2"/>
        <circle cx="10" cy="10" r="4" fill="#00ffff"/>
      </svg>
    `;

    const newHistoryMarkers = sortedHistory.slice(0, -1).map((entry, index) => {
      return new google.maps.Marker({
        position: { lat: entry.latitude, lng: entry.longitude },
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(smallMarkerSvg),
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 10),
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
    map.setZoom(18);
  }, [map, selectedHistoryEntry]);

  const resetView = () => {
    if (!map) return;
    map.setHeading(0);
    map.setTilt(is3D ? 60 : 0);
    map.setZoom(17);
    map.panTo({ lat: latitude, lng: longitude });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        <div className="absolute inset-0 border border-primary/30 rounded-2xl" />
      </div>

      {/* 3D Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setIs3D(!is3D)}
          className={`p-3 rounded-xl backdrop-blur-xl transition-all duration-300 group ${
            is3D 
              ? 'bg-primary/20 border border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.3)]' 
              : 'bg-card/80 border border-border/50 hover:border-primary/30'
          }`}
          title={is3D ? 'Switch to 2D' : 'Switch to 3D'}
        >
          <Mountain className={`w-5 h-5 transition-colors ${is3D ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          disabled={!is3D}
          className={`p-3 rounded-xl backdrop-blur-xl transition-all duration-300 group ${
            isRotating 
              ? 'bg-secondary/20 border border-secondary/50 shadow-[0_0_20px_hsl(var(--secondary)/0.3)]' 
              : 'bg-card/80 border border-border/50 hover:border-secondary/30'
          } ${!is3D ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isRotating ? 'Stop rotation' : 'Auto-rotate'}
        >
          <RotateCcw className={`w-5 h-5 transition-colors ${
            isRotating 
              ? 'text-secondary animate-spin' 
              : 'text-muted-foreground group-hover:text-secondary'
          }`} style={{ animationDuration: '3s' }} />
        </button>

        <button
          onClick={resetView}
          className="p-3 rounded-xl bg-card/80 border border-border/50 hover:border-accent/30 backdrop-blur-xl transition-all duration-300 group"
          title="Reset view"
        >
          <Maximize2 className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
        </button>
      </div>

      {/* 3D indicator */}
      {is3D && (
        <div className="absolute top-4 left-4 glass-panel px-4 py-2 flex items-center gap-2">
          <Box className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-display text-primary">3D VIEW</span>
        </div>
      )}

      {/* Trail legend */}
      {history.length > 1 && (
        <div className="absolute bottom-4 left-4 glass-panel px-4 py-2 flex items-center gap-3">
          <div className="w-10 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta rounded-full" />
          <span className="text-xs text-muted-foreground">Movement Trail</span>
          <span className="text-xs font-display text-neon-green">{history.length} points</span>
        </div>
      )}

      {/* Compass */}
      <div className="absolute bottom-4 right-4 w-12 h-12 glass-panel rounded-full flex items-center justify-center">
        <div 
          className="w-8 h-8 relative"
          style={{ transform: `rotate(${-(map?.getHeading() || 0)}deg)`, transition: 'transform 0.1s' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-destructive" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[12px] border-t-muted-foreground" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-foreground">N</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;
