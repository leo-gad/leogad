import React from 'react';
import Header from '@/components/Header';
import GoogleMap from '@/components/GoogleMap';
import LocationPanel from '@/components/LocationPanel';
import { useFirebaseLocation } from '@/hooks/useFirebaseLocation';

const Index: React.FC = () => {
  const { latitude, longitude, isLoading, error, lastUpdated, refetch } = useFirebaseLocation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl" />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 p-6 pb-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full" style={{ minHeight: 'calc(100vh - 200px)' }}>
              {/* Map container */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <div className="h-full min-h-[400px] lg:min-h-0 neon-border rounded-2xl overflow-hidden">
                  {latitude !== 0 && longitude !== 0 ? (
                    <GoogleMap latitude={latitude} longitude={longitude} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-card">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-primary animate-ping" />
                        </div>
                        <p className="text-muted-foreground">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info panel */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <LocationPanel
                  latitude={latitude}
                  longitude={longitude}
                  lastUpdated={lastUpdated}
                  isLoading={isLoading}
                  onRefresh={refetch}
                />

                {/* Error display */}
                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Quick stats */}
                <div className="mt-4 glass-panel p-4">
                  <h3 className="font-display text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                    Quick Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source</span>
                      <span className="text-foreground">Firebase RTDB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Refresh Rate</span>
                      <span className="text-neon-green">5 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Map Provider</span>
                      <span className="text-foreground">Google Maps</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 p-4 text-center border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            <span className="gradient-text font-display">GEOTRACK</span> — Real-time location visualization powered by Firebase
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
