'use client';

import React from 'react';
import Link from 'next/link';
import { Star, CheckCircle2, Heart, Wifi, Coffee, Shield, MapPin, MessageSquare } from 'lucide-react';

export interface PropertyData {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  genderType: 'BOYS' | 'GIRLS' | 'COED';
  acType: 'AC' | 'NON_AC' | 'BOTH';
  latitude: number;
  longitude: number;
  images: string | string[];
  amenities: string[];
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  minPrice: number;
  maxPrice: number;
  hasVacancy: boolean;
  distance?: number;
  rooms: Array<{
    id: string;
    sharingType: string;
    price: number;
    availableBeds: number;
  }>;
}

interface PropertyCardProps {
  property: PropertyData;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  isCompareChecked?: boolean;
  onToggleCompare?: (property: PropertyData) => void;
  showCompareCheckbox?: boolean;
  onOpenChat?: (property: PropertyData) => void;
}

export default function PropertyCard({
  property,
  isWishlisted = false,
  onToggleWishlist,
  isCompareChecked = false,
  onToggleCompare,
  showCompareCheckbox = true,
  onOpenChat,
}: PropertyCardProps) {
  // Parse images cleanly whether array or string
  let imageUrls: string[] = [];
  try {
    if (Array.isArray(property.images)) {
      imageUrls = property.images;
    } else if (typeof property.images === 'string') {
      imageUrls = JSON.parse(property.images);
    }
  } catch (e) {
    imageUrls = [];
  }

  const defaultFallback = property.genderType === 'GIRLS'
    ? '/images/girls/girls-hostel-services.webp'
    : property.genderType === 'BOYS'
    ? '/images/boys/pg-hostels-for-men.jpg'
    : '/images/boys/hostel-building-main.jpg';

  const mainImage = (imageUrls && imageUrls.length > 0 && imageUrls[0]) ? imageUrls[0] : defaultFallback;

  // Calculate remaining beds
  const totalBedsLeft = property.rooms.reduce((acc, room) => acc + room.availableBeds, 0);

  return (
    <div className="bg-[#0e1424] rounded-2xl shadow-lg border border-slate-800/80 overflow-hidden flex flex-col sm:flex-row hover:border-slate-700 hover:bg-[#11192d] transition-all group">
      {/* Property Image Container */}
      <div className="relative w-full sm:w-52 md:w-60 h-48 sm:h-auto flex-shrink-0 bg-slate-900 overflow-hidden">
        <img
          src={mainImage}
          alt={property.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = defaultFallback;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:hidden" />

        {property.isVerified && (
          <div className="absolute top-3 left-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-bold shadow-md backdrop-blur-sm">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Verified</span>
          </div>
        )}

        {onToggleWishlist && (
          <button
            onClick={() => onToggleWishlist(property.id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-rose-400 border border-slate-700/60 transition-all shadow-md focus:outline-none"
            title="Save to Wishlist"
          >
            <Heart size={16} className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
          </button>
        )}

        {/* Gender Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-slate-200 shadow-md uppercase tracking-wider backdrop-blur-sm">
          {property.genderType === 'BOYS' ? 'Boys PG' : property.genderType === 'GIRLS' ? 'Girls PG' : 'Co-ed / Unisex'}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-white text-base sm:text-lg hover:text-emerald-400 transition-colors line-clamp-1">
              <Link href={`/seeker/properties/${property.id}`}>{property.name}</Link>
            </h3>
            {/* Review Badge */}
            <div className="flex items-center text-xs font-bold bg-amber-950/60 border border-amber-700/50 text-amber-300 px-2.5 py-1 rounded-lg flex-shrink-0">
              <Star size={13} className="fill-amber-400 text-amber-400 mr-1" />
              <span>{property.avgRating > 0 ? property.avgRating.toFixed(1) : 'New'}</span>
              {property.totalReviews > 0 && (
                <span className="text-amber-400/60 font-normal text-[10px] ml-1">({property.totalReviews})</span>
              )}
            </div>
          </div>

          <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1 line-clamp-1">
            <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
            <span>{property.address}</span>
          </p>

          {/* Distance and AC Badge */}
          <div className="flex flex-wrap gap-2 items-center mt-3">
            {property.distance !== undefined && property.distance > 0 && (
              <span className="text-[11px] text-slate-300 bg-slate-800/80 border border-slate-700/70 px-2 py-0.5 rounded-md font-medium">
                {property.distance.toFixed(1)} km away
              </span>
            )}
            <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md font-semibold uppercase">
              {property.acType === 'AC' ? 'AC Rooms' : property.acType === 'NON_AC' ? 'Non-AC' : 'AC / Non-AC'}
            </span>
            {/* Vacancy indicator */}
            {totalBedsLeft > 0 ? (
              <span className="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md font-semibold">
                {totalBedsLeft} {totalBedsLeft === 1 ? 'bed' : 'beds'} available
              </span>
            ) : (
              <span className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-800/50 px-2 py-0.5 rounded-md font-semibold">
                Fully Booked
              </span>
            )}
          </div>

          {/* Quick Amenities */}
          <div className="flex gap-3.5 items-center text-slate-400 text-xs mt-3.5 pt-2.5 border-t border-slate-800/60">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                {amenity.toLowerCase().includes('wifi') && <Wifi size={13} className="text-emerald-400" />}
                {amenity.toLowerCase().includes('food') && <Coffee size={13} className="text-amber-400" />}
                {amenity.toLowerCase().includes('cctv') && <Shield size={13} className="text-cyan-400" />}
                <span>{amenity}</span>
              </div>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-slate-500 text-[11px]">+{property.amenities.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="flex justify-between items-center border-t border-slate-800/80 pt-3.5 mt-3.5">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Starts from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-black text-lg sm:text-xl">₹{property.minPrice.toLocaleString()}</span>
              <span className="text-slate-400 text-xs">/mo</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Chat / Voice Note Button */}
            {onOpenChat && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenChat(property);
                }}
                className="p-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-300 hover:text-white border border-cyan-800/80 transition-all flex items-center justify-center shadow-sm"
                title="Chat or send voice note to Owner"
              >
                <MessageSquare size={16} />
              </button>
            )}

            {/* Compare Checkbox */}
            {showCompareCheckbox && onToggleCompare && (
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-400 hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  checked={isCompareChecked}
                  onChange={() => onToggleCompare(property)}
                />
                <span>Compare</span>
              </label>
            )}

            <Link
              href={`/seeker/properties/${property.id}`}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              View Detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
