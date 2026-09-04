'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import PropertyCard, { PropertyData } from '@/components/PropertyCard';
import { Heart, RefreshCw, Compass } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seeker/wishlist');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const handleToggleWishlist = async (id: string) => {
    try {
      const res = await fetch('/api/seeker/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id }),
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Error removing from wishlist:', e);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Loading wishlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400">
              <Heart className="fill-rose-500 text-rose-500" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Saved Hostels</h1>
              <p className="text-xs text-slate-400">Accommodations you marked for later</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            {properties.length} {properties.length === 1 ? 'PG' : 'PGs'}
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="bg-[#0e1424] rounded-2xl p-12 border border-slate-800 text-center shadow-xl space-y-3">
            <Compass className="mx-auto text-slate-600" size={48} />
            <h2 className="text-lg font-bold text-white">No saved accommodations yet</h2>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Click the heart icon on any PG card to bookmark it for quick access.
            </p>
            <div className="pt-2">
              <Link
                href="/seeker"
                className="inline-flex bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Explore listings
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isWishlisted={true}
                onToggleWishlist={handleToggleWishlist}
                showCompareCheckbox={false}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
