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
  // Parse images cleanly
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
    <div className="bg-white rounded-2xl shadow-sm border border-[#E4E1D6] overflow-hidden flex flex-col sm:flex-row hover:border-[#A9B3AA] hover:shadow-md transition-all group">
      {/* Property Image Container */}
      <div className="relative w-full sm:w-56 md:w-64 h-52 sm:h-auto flex-shrink-0 bg-[#F3F1E7] overflow-hidden">
        <img
          src={mainImage}
          alt={property.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = defaultFallback;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />

        {property.isVerified && (
          <div className="absolute top-3 left-3 bg-[#2C3E36]/90 border border-[#A9B3AA]/50 text-[#F3F1E7] flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur-sm">
            <CheckCircle2 size={13} className="text-[#D9D3B8]" />
            <span>Verified</span>
          </div>
        )}

        {onToggleWishlist && (
          <button
            onClick={() => onToggleWishlist(property.id)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#6B6B63] hover:text-rose-600 border border-[#E4E1D6] transition-all shadow-sm focus:outline-none"
            title="Save to Wishlist"
          >
            <Heart size={16} className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
          </button>
        )}

        {/* Gender Category Tag */}
        <div className="absolute bottom-3 left-3 bg-[#F3F1E7]/95 border border-[#E4E1D6] px-2.5 py-1 rounded-md text-[10px] font-bold text-[#2C3E36] shadow-sm uppercase tracking-wider backdrop-blur-sm">
          {property.genderType === 'BOYS' ? 'Boys Stay' : property.genderType === 'GIRLS' ? 'Girls Stay' : 'Co-ed Residency'}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif font-bold text-[#2A2A2A] text-lg sm:text-xl hover:text-[#2C3E36] transition-colors line-clamp-1">
              <Link href={`/seeker/properties/${property.id}`}>{property.name}</Link>
            </h3>
            {/* Rating Badge */}
            <div className="flex items-center text-xs font-bold bg-[#D9D3B8]/60 border border-[#D9D3B8] text-[#2C3E36] px-2.5 py-1 rounded-lg flex-shrink-0">
              <Star size={13} className="fill-[#2C3E36] text-[#2C3E36] mr-1" />
              <span>{property.avgRating > 0 ? property.avgRating.toFixed(1) : 'New'}</span>
              {property.totalReviews > 0 && (
                <span className="text-[#6B6B63] font-normal text-[10px] ml-1">({property.totalReviews})</span>
              )}
            </div>
          </div>

          <p className="text-[#6B6B63] text-xs mt-1.5 flex items-center gap-1 line-clamp-1">
            <MapPin size={13} className="text-[#2C3E36] flex-shrink-0" />
            <span>{property.address}</span>
          </p>

          {/* Distance and AC Badge */}
          <div className="flex flex-wrap gap-2 items-center mt-3">
            {property.distance !== undefined && property.distance > 0 && (
              <span className="text-[11px] text-[#2A2A2A] bg-[#F3F1E7] border border-[#E4E1D6] px-2.5 py-0.5 rounded-md font-medium">
                {property.distance.toFixed(1)} km away
              </span>
            )}
            <span className="text-[11px] text-[#2C3E36] bg-[#A9B3AA]/30 border border-[#A9B3AA]/60 px-2.5 py-0.5 rounded-md font-semibold uppercase">
              {property.acType === 'AC' ? 'AC Rooms' : property.acType === 'NON_AC' ? 'Non-AC' : 'AC / Non-AC'}
            </span>
            {/* Vacancy indicator */}
            {totalBedsLeft > 0 ? (
              <span className="text-[11px] text-[#2C3E36] bg-[#D9D3B8]/70 border border-[#D9D3B8] px-2.5 py-0.5 rounded-md font-semibold">
                {totalBedsLeft} {totalBedsLeft === 1 ? 'bed' : 'beds'} available
              </span>
            ) : (
              <span className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md font-semibold">
                Fully Booked
              </span>
            )}
          </div>

          {/* Quick Amenities */}
          <div className="flex gap-4 items-center text-[#6B6B63] text-xs mt-4 pt-3 border-t border-[#E4E1D6]">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-[#2A2A2A]">
                {amenity.toLowerCase().includes('wifi') && <Wifi size={13} className="text-[#2C3E36]" />}
                {amenity.toLowerCase().includes('food') && <Coffee size={13} className="text-[#2C3E36]" />}
                {amenity.toLowerCase().includes('cctv') && <Shield size={13} className="text-[#2C3E36]" />}
                <span>{amenity}</span>
              </div>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[#6B6B63] text-[11px]">+{property.amenities.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="flex justify-between items-center border-t border-[#E4E1D6] pt-4 mt-4">
          <div>
            <span className="text-[#6B6B63] text-[10px] uppercase font-semibold tracking-wider block">Starts from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[#2C3E36] font-serif font-bold text-xl sm:text-2xl">₹{property.minPrice.toLocaleString()}</span>
              <span className="text-[#6B6B63] text-xs">/month</span>
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
                className="p-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#D9D3B8] text-[#2C3E36] border border-[#E4E1D6] transition-all flex items-center justify-center shadow-sm"
                title="Message or send voice note to Host"
              >
                <MessageSquare size={16} />
              </button>
            )}

            {/* Compare Checkbox */}
            {showCompareCheckbox && onToggleCompare && (
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#6B6B63] hover:text-[#2A2A2A] transition-colors select-none">
                <input
                  type="checkbox"
                  className="rounded border-[#E4E1D6] text-[#2C3E36] focus:ring-[#2C3E36] focus:ring-offset-white"
                  checked={isCompareChecked}
                  onChange={() => onToggleCompare(property)}
                />
                <span>Compare</span>
              </label>
            )}

            <Link
              href={`/seeker/properties/${property.id}`}
              className="bg-[#2C3E36] hover:bg-[#22312B] text-[#F3F1E7] font-semibold py-2 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
            >
              View Residence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
