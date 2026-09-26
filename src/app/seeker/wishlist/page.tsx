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

  const handleOpenChat = async (property: PropertyData) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch('/api/seeker/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          message: `Hi, I am interested in ${property.name} and would like to know about bed availability and terms.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const enqId = data.enquiry?.id || data.newMessage?.enquiryId;
        if (enqId) {
          localStorage.setItem('active_chat_enquiry_id', enqId);
        }
      }
      router.push('/seeker/chat');
    } catch (e) {
      router.push('/seeker/chat');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7]">
        <div className="flex items-center space-x-2 text-[#2C3E36] font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Loading wishlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F1E7] text-[#2A2A2A] pb-20 font-sans selection:bg-[#2C3E36] selection:text-[#F3F1E7]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#E4E1D6] text-rose-500 shadow-sm">
              <Heart className="fill-rose-500 text-rose-500" size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">Saved Accommodations</h1>
              <p className="text-xs text-[#6B6B63]">Properties you bookmarked for later</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#2C3E36] bg-[#D9D3B8] border border-[#C7BF9E] px-3 py-1 rounded-full">
            {properties.length} {properties.length === 1 ? 'Stay' : 'Stays'}
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#E4E1D6] text-center shadow-sm space-y-3">
            <Compass className="mx-auto text-[#6B6B63]" size={48} />
            <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">No saved accommodations yet</h2>
            <p className="text-[#6B6B63] text-xs max-w-sm mx-auto leading-relaxed">
              Click the heart icon on any PG card to bookmark it for quick access.
            </p>
            <div className="pt-2">
              <Link
                href="/seeker"
                className="inline-flex bg-[#2C3E36] hover:bg-[#22312B] text-[#F3F1E7] font-semibold py-2.5 px-6 rounded-xl text-xs transition-all shadow-sm"
              >
                Browse Stays
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
                onOpenChat={handleOpenChat}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
