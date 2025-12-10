import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface HistoryEntry {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface UseFirebaseLocationReturn {
  latitude: number;
  longitude: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  history: HistoryEntry[];
  isGpsActive: boolean;
  refetch: () => Promise<void>;
}

const FIREBASE_URL = 'https://dht11-9aca0-default-rtdb.firebaseio.com';

export const useFirebaseLocation = (): UseFirebaseLocationReturn => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastSavedPosition, setLastSavedPosition] = useState<string>('');
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  // Save location to history on Firebase
  const saveToHistory = useCallback(async (lat: number, lng: number) => {
    const positionKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    
    // Only save if position has changed
    if (positionKey === lastSavedPosition) return;
    
    try {
      const historyEntry = {
        latitude: lat,
        longitude: lng,
        timestamp: Date.now(),
      };

      await fetch(`${FIREBASE_URL}/history.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyEntry),
      });

      setLastSavedPosition(positionKey);
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  }, [lastSavedPosition]);

  // Fetch location history from Firebase
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${FIREBASE_URL}/history.json`);
      const data = await response.json();

      if (data) {
        const entries: HistoryEntry[] = Object.entries(data).map(([id, entry]: [string, any]) => ({
          id,
          latitude: entry.latitude,
          longitude: entry.longitude,
          timestamp: entry.timestamp,
        }));

        // Sort by timestamp, newest first
        entries.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(entries);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  const fetchLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${FIREBASE_URL}/.json`);

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();

      // Check GPS active status from Firebase 'active' field (1 = active, 0 = inactive)
      const gpsActive = data?.active === 1 || data?.active === "1";
      setIsGpsActive(gpsActive);

      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setLastUpdated(new Date());

        // Save to history only if GPS is active
        if (gpsActive) {
          await saveToHistory(data.latitude, data.longitude);
        }
        
        // Refresh history
        await fetchHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [saveToHistory, fetchHistory]);

  useEffect(() => {
    fetchLocation();

    // Poll for updates every 5 seconds
    const intervalId = setInterval(fetchLocation, 5000);

    return () => clearInterval(intervalId);
  }, [fetchLocation]);

  return {
    latitude,
    longitude,
    isLoading,
    error,
    lastUpdated,
    history,
    isGpsActive,
    refetch: fetchLocation,
  };
};
