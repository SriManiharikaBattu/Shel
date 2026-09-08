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
      router.push('/auth/login');
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
    // Clear previous comparison on leaving so next selection is clean
    localStorage.removeItem('compare_properties');
    router.push('/seeker');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="text-emerald-400 font-semibold flex items-center gap-2">
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
              <Columns size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Compare Accommodations</h1>
              <p className="text-xs text-slate-400">Side-by-side analysis of room pricing, amenities, and policies</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {properties.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 px-3.5 py-2 rounded-xl transition-colors"
                title="Clear all compared hostels"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
            <button
              onClick={handleBackToSearch}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft size={14} /> Back to Search
            </button>
          </div>
        </div>

        {properties.length < 2 ? (
          <div className="bg-[#0e1424] rounded-2xl p-12 border border-slate-800 text-center shadow-xl max-w-xl mx-auto space-y-3">
            <ShieldAlert className="mx-auto text-slate-600" size={48} />
            <h2 className="text-lg font-bold text-white">Select at least 2 properties to compare</h2>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Navigate back to search results and check the "Compare" box on multiple hostels to view them side-by-side.
            </p>
            <div className="pt-2">
              <button
                onClick={handleBackToSearch}
                className="inline-flex bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Go to search
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-slate-800 border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 divide-x divide-slate-800">
                    <th className="w-64 p-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900 sticky left-0 z-10">
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
                            className="absolute top-4 right-4 bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 p-1.5 rounded-full focus:outline-none border border-rose-800 transition-colors"
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                          <div className="space-y-3">
                            <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                              <img src={mainImage} alt={prop.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-white text-sm leading-snug line-clamp-1">{prop.name}</h3>
                              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{prop.address}</p>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 divide-x divide-slate-800">
                  {/* Rent starting */}
                  <tr className="divide-x divide-slate-800">
                    <td className="p-4 text-xs font-bold text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                      Starting Rent
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-base font-extrabold text-emerald-400">
                        ₹{prop.minPrice.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span>
                      </td>
                    ))}
                  </tr>

                  {/* Gender Category */}
                  <tr className="divide-x divide-slate-800">
                    <td className="p-4 text-xs font-bold text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                      Gender Category
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-sm">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 text-slate-200">
                          {prop.genderType === 'BOYS' ? 'Boys PG' : prop.genderType === 'GIRLS' ? 'Girls PG' : 'Co-ed / Unisex'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* AC type */}
                  <tr className="divide-x divide-slate-800">
                    <td className="p-4 text-xs font-bold text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                      AC Facility
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold">
                        {prop.acType === 'AC' ? (
                          <span className="text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">AC Rooms Only</span>
                        ) : prop.acType === 'NON_AC' ? (
                          <span className="text-rose-400 bg-rose-950/60 border border-rose-800/70 px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-semibold">
                            <X size={13} className="text-rose-400" /> Non-AC Only
                          </span>
                        ) : (
                          <span className="text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">AC & Non-AC Available</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Verified badge */}
                  <tr className="divide-x divide-slate-800">
                    <td className="p-4 text-xs font-bold text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                      Verification Status
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold">
                        {prop.isVerified ? (
                          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 font-bold">
                            <CheckCircle2 size={14} className="text-emerald-400" /> Verified PG
                          </span>
                        ) : (
                          <span className="text-rose-400 bg-rose-950/70 border border-rose-800/80 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 font-bold">
                            <X size={14} className="text-rose-400 stroke-[2.5]" /> Not Verified
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Ratings */}
                  <tr className="divide-x divide-slate-800">
                    <td className="p-4 text-xs font-bold text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                      Ratings & Reviews
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span className="font-bold">{prop.avgRating > 0 ? prop.avgRating.toFixed(1) : 'New'}</span>
                          <span className="text-slate-500 text-[11px]">({prop.totalReviews} verified reviews)</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Room Configurations (Ordered by Sharing: Single -> Double -> Triple -> Dormitory) */}
                  <tr className="divide-x divide-slate-800">
                    <td className="p-4 text-xs font-bold text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                      Room Types & Pricing
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4 text-xs font-semibold text-slate-300 space-y-1.5">
                        {prop.rooms && prop.rooms.map((room: any, idx: number) => {
                          const label = room.sharingType === 'SINGLE' ? 'Single Room'
                            : room.sharingType === 'DOUBLE' ? 'Double Sharing'
                            : room.sharingType === 'TRIPLE' ? 'Triple Sharing'
                            : 'Four Sharing / Dormitory';
                          return (
                            <div key={idx} className="flex justify-between items-center py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800">
                              <span className="text-slate-400 text-[11px] font-medium">{label}</span>
                              <span className="font-bold text-emerald-400">₹{room.price.toLocaleString()}/mo</span>
                            </div>
                          );
                        })}
                      </td>
                    ))}
                  </tr>

                  {/* Amenities comparison section */}
                  <tr>
                    <td colSpan={properties.length + 1} className="bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-emerald-400 uppercase tracking-wider sticky left-0 border-y border-slate-800">
                      Amenities & Facilities
                    </td>
                  </tr>

                  {allAmenities.map((amenity) => (
                    <tr key={amenity} className="divide-x divide-slate-800">
                      <td className="p-4 text-xs font-medium text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                        {amenity}
                      </td>
                      {properties.map((prop) => {
                        const hasAmenity = prop.amenities.includes(amenity);
                        return (
                          <td key={prop.id} className="p-4 text-center">
                            {hasAmenity ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 mx-auto shadow-sm">
                                <Check size={16} className="text-emerald-400 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-950/80 border border-rose-800 text-rose-500 mx-auto shadow-sm">
                                <X size={16} className="text-rose-500 stroke-[2.5]" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Actions */}
                  <tr className="divide-x divide-slate-800">
                    <td className="p-4 text-xs font-bold text-slate-300 bg-slate-900/60 sticky left-0 z-10 border-r border-slate-800">
                      Action
                    </td>
                    {properties.map((prop) => (
                      <td key={prop.id} className="p-4">
                        <Link
                          href={`/seeker/properties/${prop.id}`}
                          className="block text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
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
