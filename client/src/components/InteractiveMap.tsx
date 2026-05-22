import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Custom icons setup using HTML divIcons (avoids Leaflet relative asset issues)
const createSellerIcon = (category: string, name: string) => {
  let emoji = '🛒';
  if (category === 'bakery') emoji = '🍰';
  else if (category === 'food') emoji = '🍱';
  else if (category === 'snacks') emoji = '🧁';
  else if (category === 'crafts') emoji = '🧴';
  else if (category === 'beverages') emoji = '🥤';

  return L.divIcon({
    html: `
      <div class="flex flex-col items-center cursor-pointer group">
        <div class="w-10 h-10 bg-white border-2 border-primary rounded-full shadow-premium flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
          ${emoji}
        </div>
        <div class="px-1.5 py-0.5 bg-textPrimary text-white text-[9px] rounded shadow-premium font-medium mt-1 truncate max-w-[80px]">
          ${name}
        </div>
      </div>
    `,
    className: 'seller-custom-pin',
    iconSize: [40, 55],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center">
        <span class="pulse-gps-dot"></span>
      </div>
    `,
    className: 'user-pulse-pin',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Component to dynamically re-center map if coordinates change
const MapController = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

// Component to handle map clicks for manual coordinate picks
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    const handleContext = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('dblclick', handleContext);
    return () => {
      map.off('dblclick', handleContext);
    };
  }, [map, onMapClick]);
  return null;
};

interface IMapSeller {
  _id: string;
  businessName: string;
  category: string;
  slug: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
  distanceKm?: number;
  address: {
    addressLine: string;
  };
}

interface IInteractiveMapProps {
  userLat: number;
  userLng: number;
  radiusKm: number;
  sellers: IMapSeller[];
  onManualPinChange?: (lat: number, lng: number) => void;
}

export const InteractiveMap: React.FC<IInteractiveMapProps> = ({
  userLat,
  userLng,
  radiusKm,
  sellers,
  onManualPinChange
}) => {
  
  const handleMapClick = (lat: number, lng: number) => {
    if (onManualPinChange) {
      onManualPinChange(lat, lng);
    }
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-warmborder shadow-premium">
      <MapContainer
        center={[userLat, userLng]}
        zoom={14}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Recenter controller */}
        <MapController lat={userLat} lng={userLng} />

        {/* Double-click coordinate change listener */}
        <MapEvents onMapClick={handleMapClick} />

        {/* User Pulsing Marker */}
        <Marker position={[userLat, userLng]} icon={createUserIcon()}>
          <Popup>
            <div className="p-2 text-center">
              <p className="font-semibold text-xs text-primary">Your Location Hub</p>
              <p className="text-[10px] text-textSecondary mt-0.5">Double-click anywhere on map to shift address hub!</p>
            </div>
          </Popup>
        </Marker>

        {/* Search radius circle indicator */}
        <Circle
          center={[userLat, userLng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#E85D26',
            fillColor: '#E85D26',
            fillOpacity: 0.05,
            weight: 1.5,
            dashArray: '5, 5'
          }}
        />

        {/* Render Seller Custom Pins */}
        {sellers.map((seller) => {
          const coords = seller.location.coordinates;
          // coordinates in GeoJSON = [lng, lat]
          const sellerLat = coords[1];
          const sellerLng = coords[0];

          return (
            <Marker
              key={seller._id}
              position={[sellerLat, sellerLng]}
              icon={createSellerIcon(seller.category, seller.businessName)}
            >
              <Popup>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[8px] font-bold rounded-full uppercase tracking-wider bg-surfaceAlt text-primary">
                      {seller.category}
                    </span>
                    {seller.distanceKm !== undefined && (
                      <span className="text-[10px] font-mono font-semibold text-secondary">
                        {seller.distanceKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-textPrimary mt-1 truncate">
                    {seller.businessName}
                  </h4>
                  <p className="text-[10px] text-textSecondary truncate mt-0.5">
                    {seller.address.addressLine}
                  </p>
                  
                  <Link
                    to={`/seller/${seller.slug}`}
                    className="block w-full py-1.5 mt-3 text-center text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors duration-200"
                  >
                    View Storefront &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating help tooltip */}
      <div className="absolute bottom-4 left-4 z-[999] bg-textPrimary/90 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-lifted pointer-events-none font-medium">
        💡 Double-click map to test nearby filters at different locations!
      </div>
    </div>
  );
};
