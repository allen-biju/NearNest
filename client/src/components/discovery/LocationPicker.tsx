import React from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col gap-3 p-4 bg-warmSurface border border-warmborder rounded-lg">
      {error && (
        <div className="flex gap-2 items-start p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {currentLocation && (
        <div className="text-sm text-textSecondary">
          📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
        </div>
      )}

      <button
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primaryDark disabled:opacity-50 transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Detecting...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Use Current Location
          </>
        )}
      </button>
    </div>
  );
};

export default LocationPicker;
