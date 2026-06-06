import React from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  isLoading?: boolean;
  currentLocation?: { lat: number; lng: number };
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  isLoading = false,
  currentLocation
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const getCurrentLocation = () => {
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to access your location. Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className="flex flex-col gap-3.5 p-5 bg-white border border-warmborder rounded-[24px] shadow-sm">
      {error && (
        <div className="flex gap-2.5 items-start p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {currentLocation && (
        <div className="text-xs text-textSecondary font-medium flex items-center gap-1">
          <span>🎯 Active Hub coordinates:</span>
          <span className="font-mono font-bold text-textPrimary">
            {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </span>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="w-full py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-xl shadow-premium uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Detecting Hub...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Detect GPS Location
          </>
        )}
      </motion.button>
    </div>
  );
};

export default LocationPicker;
