import React from 'react';
import { MapPin, Navigation, Compass, RefreshCw, Activity } from 'lucide-react';

interface LocationPanelProps {
  latitude: number;
  longitude: number;
  lastUpdated: Date | null;
  isLoading: boolean;
  isGpsActive: boolean;
  onRefresh: () => void;
}

const LocationPanel: React.FC<LocationPanelProps> = ({
  latitude,
  longitude,
  lastUpdated,
  isLoading,
  isGpsActive,
  onRefresh,
}) => {
  const formatCoordinate = (value: number, isLatitude: boolean) => {
    const direction = isLatitude
      ? value >= 0 ? 'N' : 'S'
      : value >= 0 ? 'E' : 'W';
    return `${Math.abs(value).toFixed(5)}° ${direction}`;
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-glow">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold gradient-text">
              Live Location
            </h2>
            <p className="text-sm text-muted-foreground">Real-time tracking</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all duration-300 group neon-border"
        >
          <RefreshCw className={`w-5 h-5 text-primary ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Navigation className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs uppercase tracking-wider">Latitude</span>
          </div>
          <p className="font-display text-lg text-foreground">
            {formatCoordinate(latitude, true)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="w-4 h-4 text-neon-magenta" />
            <span className="text-xs uppercase tracking-wider">Longitude</span>
          </div>
          <p className="font-display text-lg text-foreground">
            {formatCoordinate(longitude, false)}
          </p>
        </div>
      </div>

      {/* GPS Status indicator */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${
        isGpsActive 
          ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20' 
          : 'bg-destructive/10 border-destructive/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className={`w-5 h-5 ${isGpsActive ? 'text-neon-green' : 'text-destructive'}`} />
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
              isGpsActive ? 'bg-neon-green animate-pulse' : 'bg-destructive'
            }`} />
          </div>
          <span className="text-sm font-medium text-foreground">
            {isGpsActive ? 'GPS Active' : 'GPS Inactive'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString()}`
            : 'Fetching...'}
        </div>
      </div>

      {/* Decorative element */}
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
    </div>
  );
};

export default LocationPanel;
