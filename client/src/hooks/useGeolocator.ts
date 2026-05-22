import { useState, useEffect } from 'react';

export interface ILocationCoords {
  lat: number;
  lng: number;
  label: string;
}

// Pre-seeded local hubs in Calicut, Kerala
export const SEEDED_HUBS: ILocationCoords[] = [
  { lat: 11.2588, lng: 75.7804, label: 'Kozhikode Beach, Calicut' },
  { lat: 11.2640, lng: 75.7870, label: 'Mavoor Road (Town Center)' },
  { lat: 11.2750, lng: 75.8202, label: 'Calicut CyberPark' },
  { lat: 11.2480, lng: 75.7950, label: 'Chalappuram Suburb' }
];

export const useGeolocator = () => {
  const [coords, setCoords] = useState<ILocationCoords>({
    lat: Number(localStorage.getItem('nn_lat')) || 11.2588,
    lng: Number(localStorage.getItem('nn_lng')) || 75.7804,
    label: localStorage.getItem('nn_label') || 'Kozhikode Beach, Calicut (Default)'
  });
  const [radiusKm, setRadiusKm] = useState<number>(Number(localStorage.getItem('nn_radius')) || 5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync coords to localStorage on changes
  useEffect(() => {
    localStorage.setItem('nn_lat', coords.lat.toString());
    localStorage.setItem('nn_lng', coords.lng.toString());
    localStorage.setItem('nn_label', coords.label);
  }, [coords]);

  useEffect(() => {
    localStorage.setItem('nn_radius', radiusKm.toString());
  }, [radiusKm]);

  // Request actual device GPS coordinates
  const acquireDeviceGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({
          lat: latitude,
          lng: longitude,
          label: `My Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        });
        setLoading(false);
        console.log('🛰️ Device GPS acquired:', latitude, longitude);
      },
      (err) => {
        console.warn('⚠️ Geolocation access denied or failed:', err);
        setError('GPS Access Denied. Centered on default Calicut Beach hub.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectManualLocation = (newLocation: ILocationCoords) => {
    setCoords(newLocation);
    setError(null);
  };

  return {
    coords,
    radiusKm,
    setRadiusKm,
    loading,
    error,
    acquireDeviceGPS,
    selectManualLocation
  };
};
