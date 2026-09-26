'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Property Marker Icon matching the Resort Editorial aesthetic
const propertyIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom GPS User Location Marker with live radar pulse
const gpsUserIcon = L.divIcon({
  className: 'custom-gps-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(44, 62, 54, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #2C3E36; border: 2.5px solid #F3F1E7; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

interface PropertyPin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  minPrice: number;
  genderType: string;
  distance?: number;
}

interface MapProps {
  properties: PropertyPin[];
  center: [number, number];
  userLocation?: [number, number];
  onSelectProperty?: (id: string) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Map({ properties, center, userLocation, onSelectProperty }: MapProps) {
  const activeUserPos = userLocation || center;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-[#E4E1D6]" style={{ minHeight: '350px' }}>
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

        {/* Live GPS / Center Radar Beacon */}
        {activeUserPos && (
          <>
            <Marker position={activeUserPos} icon={gpsUserIcon}>
              <Popup>
                <div className="p-1 font-sans text-center">
                  <div className="font-semibold text-xs text-[#2C3E36] flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2C3E36] inline-block animate-pulse"></span>
                    <span>Your Location (GPS Radar Center)</span>
                  </div>
                  <div className="text-[10px] text-[#6B6B63] mt-0.5">
                    {activeUserPos[0].toFixed(4)}, {activeUserPos[1].toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={activeUserPos}
              radius={3500}
              pathOptions={{
                color: '#2C3E36',
                fillColor: '#A9B3AA',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 6'
              }}
            />
          </>
        )}

        {/* Property Markers */}
        {properties.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.latitude, prop.longitude]}
            icon={propertyIcon}
            eventHandlers={{
              click: () => onSelectProperty && onSelectProperty(prop.id),
            }}
          >
            <Popup>
              <div className="p-1.5 font-sans min-w-[160px]">
                <h4 className="font-serif font-semibold text-[#2C3E36] text-sm leading-snug">{prop.name}</h4>
                <div className="flex items-center justify-between gap-1.5 mt-1.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#D9D3B8]/60 text-[#2C3E36] border border-[#D9D3B8]">
                    {prop.genderType}
                  </span>
                  <span className="text-[#2A2A2A] text-xs font-semibold">
                    ₹{prop.minPrice.toLocaleString('en-IN')}<span className="text-[10px] text-[#6B6B63] font-normal">/mo</span>
                  </span>
                </div>
                {typeof prop.distance === 'number' && prop.distance > 0 && (
                  <div className="text-[10px] text-[#6B6B63] mt-1 text-right">
                    📍 {prop.distance.toFixed(1)} km away
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
