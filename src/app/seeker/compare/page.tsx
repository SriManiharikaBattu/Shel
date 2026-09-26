'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { Columns, ArrowLeft, Star, Check, X, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/seeker');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const data = localStorage.getItem('compare_properties');
    if (data) {
      try {
        setProperties(JSON.parse(data));
      } catch (e) {
        console.error('Error parsing comparison items:', e);
      }
    }
  }, []);

  const handleRemoveItem = (id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    if (updated.length === 0) {
      localStorage.removeItem('compare_properties');
    } else {
      localStorage.setItem('compare_properties', JSON.stringify(updated));
    }
  };

  const handleClearAll = () => {
    setProperties([]);
    localStorage.removeItem('compare_properties');
  };

  const handleBackToSearch = () => {
    localStorage.removeItem('compare_properties');
    router.push('/seeker');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7]">
        <div className="text-[#2C3E36] font-semibold flex items-center gap-2">
          <span>Loading comparison page...</span>
        </div>
      </div>
    );
  }

  // Get all unique amenities across all properties for structured row checks
  const allAmenities = Array.from(
    new Set(properties.flatMap((p) => p.amenities || []))
  );

  return (
    <div className="min-h-screen bg-[#F3F1E7] text-[#2A2A2A] pb-20 font-sans selection:bg-[#2C3E36] selection:text-[#F3F1E7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E4E1D6] text-[#2C3E36] shadow-sm">
              <Columns size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">Compare Accommodations</h1>
              <p className="text-xs text-[#6B6B63]">Side-by-side analysis of room pricing, amenities, and policies</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {properties.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors"
                title="Clear all compared hostels"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
            <button
              onClick={handleBackToSearch}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2C3E36] hover:text-[#1E2B25] bg-white border border-[#E4E1D6] hover:bg-[#FAF9F5] px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft size={14} /> Back to Search
            </button>
          </div>
        </div>

        {properties.length < 2 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#E4E1D6] text-center shadow-sm max-w-xl mx-auto space-y-3">
            <ShieldAlert className="mx-auto text-[#6B6B63]" size={48} />
            <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">Select at least 2 properties to compare</h2>
            <p className="text-[#6B6B63] text-xs max-w-sm mx-auto leading-relaxed">
              Navigate back to search results and check the "Compare" box on multiple hostels to view them side-by-side.
            </p>
            <div className="pt-2">
              <button
                onClick={handleBackToSearch}
                className="inline-flex bg-[#2C3E36] hover:bg-[#22312B] text-[#F3F1E7] font-semibold py-2.5 px-6 rounded-xl text-xs transition-all shadow-sm"
              >
                Go to search
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E4E1D6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-[#E4E1D6] border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] divide-x divide-[#E4E1D6]">
                    <th className="w-64 p-5 text-left text-xs font-bold text-[#6B6B63] uppercase tracking-wider bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      Features
                    </th>
                    {properties.map((prop) => {
                      let imageUrls: string[] = [];
                      try {
                        imageUrls = typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images;
                      } catch (e) {
                        imageUrls = [];
                      }
                      const mainImage = imageUrls?.[0] || '/images/boys/hostel-building-main.jpg';
                      return (
                        <th key={prop.id} className="p-5 text-left relative min-w-[280px]">
                          <button
                            onClick={() => handleRemoveItem(prop.id)}
                            className="absolute top-4 right-4 bg-white hover:bg-rose-50 text-[#6B6B63] hover:text-rose-600 p-1.5 rounded-full focus:outline-none border border-[#E4E1D6] transition-colors shadow-sm"
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                          <div className="space-y-3">
                            <div className="h-36 w-full rounded-xl overflow-hidden bg-[#FAF9F5] border border-[#E4E1D6]">
                              <img src={mainImage} alt={prop.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="font-serif font-bold text-[#2A2A2A] text-base leading-snug line-clamp-1">{prop.name}</h3>
                              <p className="text-[#6B6B63] text-xs mt-0.5 line-clamp-1">{prop.address}</p>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E1D6] divide-x divide-[#E4E1D6]">
                  {/* Rent starting */}
                  <tr className="divide-x divide-[#E4E1D6]">
                    <td className="p-4 text-xs font-bold text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      Starting Rent
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-base font-serif font-bold text-[#2C3E36]">
                        ₹{prop.minPrice.toLocaleString()}<span className="text-xs font-normal text-[#6B6B63]">/mo</span>
                      </td>
                    ))}
                  </tr>

                  {/* Gender Category */}
                  <tr className="divide-x divide-[#E4E1D6]">
                    <td className="p-4 text-xs font-bold text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      Gender Category
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-sm">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#D9D3B8]/60 border border-[#D9D3B8] text-[#2C3E36]">
                          {prop.genderType === 'BOYS' ? 'Boys Stay' : prop.genderType === 'GIRLS' ? 'Girls Stay' : 'Co-ed Residency'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* AC type */}
                  <tr className="divide-x divide-[#E4E1D6]">
                    <td className="p-4 text-xs font-bold text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      AC Facility
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold">
                        {prop.acType === 'AC' ? (
                          <span className="text-[#2C3E36] bg-[#A9B3AA]/30 border border-[#A9B3AA]/60 px-2 py-0.5 rounded-md">AC Rooms Only</span>
                        ) : prop.acType === 'NON_AC' ? (
                          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-semibold">
                            <X size={13} className="text-rose-600" /> Non-AC Only
                          </span>
                        ) : (
                          <span className="text-[#2C3E36] bg-[#D9D3B8]/60 border border-[#D9D3B8] px-2 py-0.5 rounded-md">AC & Non-AC Available</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Verified badge */}
                  <tr className="divide-x divide-[#E4E1D6]">
                    <td className="p-4 text-xs font-bold text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      Verification Status
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold">
                        {prop.isVerified ? (
                          <span className="text-[#2C3E36] bg-[#D9D3B8]/70 border border-[#D9D3B8] px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 font-bold">
                            <CheckCircle2 size={14} className="text-[#2C3E36]" /> Verified PG
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 font-bold">
                            <X size={14} className="text-rose-600 stroke-[2.5]" /> Not Verified
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Ratings */}
                  <tr className="divide-x divide-[#E4E1D6]">
                    <td className="p-4 text-xs font-bold text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      Ratings & Reviews
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-[#2C3E36]">
                          <Star size={14} className="fill-[#2C3E36] text-[#2C3E36]" />
                          <span className="font-bold">{prop.avgRating > 0 ? prop.avgRating.toFixed(1) : 'New'}</span>
                          <span className="text-[#6B6B63] text-[11px]">({prop.totalReviews} verified reviews)</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Room Configurations */}
                  <tr className="divide-x divide-[#E4E1D6]">
                    <td className="p-4 text-xs font-bold text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      Room Types & Pricing
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold text-[#2A2A2A] space-y-1.5">
                        {prop.rooms && prop.rooms.map((room: any, idx: number) => {
                          const label = room.sharingType === 'SINGLE' ? 'Single Room'
                            : room.sharingType === 'DOUBLE' ? 'Double Sharing'
                            : room.sharingType === 'TRIPLE' ? 'Triple Sharing'
                            : 'Four Sharing / Dormitory';
                          return (
                            <div key={idx} className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-[#FAF9F5] border border-[#E4E1D6]">
                              <span className="text-[#6B6B63] text-[11px] font-medium">{label}</span>
                              <span className="font-bold text-[#2C3E36]">₹{room.price.toLocaleString()}/mo</span>
                            </div>
                          );
                        })}
                      </td>
                    ))}
                  </tr>

                  {/* Amenities comparison section */}
                  <tr>
                    <td colSpan={properties.length + 1} className="bg-[#FAF9F5] px-4 py-2.5 text-xs font-bold text-[#2C3E36] uppercase tracking-wider sticky left-0 border-y border-[#E4E1D6]">
                      Amenities & Facilities
                    </td>
                  </tr>

                  {allAmenities.map((amenity) => (
                    <tr key={amenity} className="divide-x divide-[#E4E1D6]">
                      <td className="p-4 text-xs font-medium text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                        {amenity}
                      </td>
                      {properties.map((prop) => {
                        const hasAmenity = prop.amenities.includes(amenity);
                        return (
                          <td key={prop.id} className="p-4 text-center">
                            {hasAmenity ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D9D3B8]/70 border border-[#D9D3B8] text-[#2C3E36] mx-auto shadow-sm">
                                <Check size={16} className="text-[#2C3E36] stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto shadow-sm">
                                <X size={16} className="text-rose-600 stroke-[2.5]" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Actions */}
                  <tr className="divide-x divide-[#E4E1D6]">
                    <td className="p-4 text-xs font-bold text-[#2A2A2A] bg-[#FAF9F5] sticky left-0 z-10 border-r border-[#E4E1D6]">
                      Action
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4">
                        <Link
                          href={`/seeker/properties/${prop.id}`}
                          className="block text-center bg-[#2C3E36] hover:bg-[#22312B] text-[#F3F1E7] font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
