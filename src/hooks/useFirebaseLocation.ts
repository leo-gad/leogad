import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface UseFirebaseLocationReturn {
  latitude: number;
  longitude: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

const FIREBASE_URL = 'https://dht11-9aca0-default-rtdb.firebaseio.com/.json';

export const useFirebaseLocation = (): UseFirebaseLocationReturn => {
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(FIREBASE_URL);
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data: LocationData = await response.json();
      
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    refetch: fetchLocation,
  };
};
