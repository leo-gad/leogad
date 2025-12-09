import React from 'react';
import { Globe, Radar } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="relative z-10 p-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Globe className="w-7 h-7 text-primary-foreground animate-spin-slow" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon-green flex items-center justify-center animate-pulse">
              <Radar className="w-3 h-3 text-background" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wider">
              <span className="gradient-text">GEO</span>
              <span className="text-foreground">TRACK</span>
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Real-time Location Visualizer
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="hidden md:flex items-center gap-3">
          <div className="px-4 py-2 rounded-full glass-panel flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
          <div className="px-4 py-2 rounded-full glass-panel flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Firebase</span>
            <span className="w-2 h-2 bg-neon-cyan rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
