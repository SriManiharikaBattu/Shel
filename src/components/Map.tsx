'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker configuration to fix missing default leaflet markers in production bundlers
const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface PropertyPin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  minPrice: number;
  genderType: string;
}

interface MapProps {
  properties: PropertyPin[];
  center: [number, number];
  onSelectProperty?: (id: string) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Map({ properties, center, onSelectProperty }: MapProps) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-200" style={{ minHeight: '350px' }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.latitude, prop.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectProperty && onSelectProperty(prop.id),
            }}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h4 className="font-bold text-gray-900 text-sm leading-tight">{prop.name}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded ${
                    prop.genderType === 'BOYS' ? 'bg-blue-50 text-blue-600' :
                    prop.genderType === 'GIRLS' ? 'bg-pink-50 text-pink-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {prop.genderType}
                  </span>
                  <span className="text-gray-600 text-xs">
                    from <span className="font-bold text-rose-500">₹{prop.minPrice}</span>/mo
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
