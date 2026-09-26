'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Search, Building2, UserCheck, Star, Shield, ArrowRight, Sparkles, MapPin } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') router.push('/admin');
      else if (user.role === 'OWNER') router.push('/owner');
      else router.push('/seeker');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7]">
        <div className="flex flex-col items-center gap-4 text-[#2C3E36] font-semibold">
          <img
            src="/logo.png"
            alt="Shel"
            className="w-14 h-14 rounded-full p-1 bg-white border-2 border-[#2C3E36] animate-pulse shadow-md"
          />
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-[#2C3E36]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium tracking-wide text-[#6B6B63]">Loading Shel Collection...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F1E7] text-[#2A2A2A] flex flex-col font-sans selection:bg-[#2C3E36] selection:text-[#F3F1E7]">
      {/* Header */}
      <header className="bg-[#2C3E36] border-b border-[#3D5349] sticky top-0 z-50 text-[#F3F1E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Shel Logo"
              className="w-10 h-10 rounded-full object-cover bg-white p-0.5 border border-[#A9B3AA]/40 shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tight text-[#F3F1E7] group-hover:text-[#D9D3B8] transition-colors">
                Shel
              </span>
              <span className="text-[9px] font-sans font-semibold tracking-widest text-[#A9B3AA] uppercase -mt-1">
                COLLECTION
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#E8E4CF] hover:text-white px-4 py-2 rounded-xl hover:bg-[#3D5349]/70 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[#D9D3B8] hover:bg-[#C7BF9E] text-[#2C3E36] font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-sm"
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-[#E4E1D6] flex-grow flex items-center bg-gradient-to-b from-[#A9B3AA]/20 via-[#F3F1E7] to-[#F3F1E7]">
        <div className="relative max-w-4xl mx-auto text-center space-y-7 z-10">
          <div className="inline-flex items-center gap-2 bg-[#D9D3B8]/60 border border-[#D9D3B8] text-[#2C3E36] py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles size={13} className="text-[#2C3E36]" />
            <span>Curated Accommodations Across 99 Cities</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#2A2A2A] tracking-tight leading-[1.15]">
            Find Your Sanctuary with <br />
            <span className="italic text-[#2C3E36]">Shel Stays.</span>
          </h1>

          <p className="text-[#6B6B63] text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
            Discover verified private hostels, residences, and boutique co-living spaces with real-time bed availability, GPS precision, and direct owner messaging.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-md mx-auto">
            <Link
              href="/seeker"
              className="flex items-center justify-center gap-2 bg-[#2C3E36] hover:bg-[#22312B] text-[#F3F1E7] font-semibold py-3.5 px-7 rounded-xl shadow-md transition-all text-base"
            >
              <Search size={18} />
              <span>Explore Hostels</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/owner"
              className="flex items-center justify-center gap-2 bg-white hover:bg-[#FAF9F5] text-[#2C3E36] border border-[#E4E1D6] font-semibold py-3.5 px-7 rounded-xl shadow-sm transition-all text-base"
            >
              <Building2 size={18} className="text-[#2C3E36]" />
              <span>List Your Property</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Hostels Gallery Showcase */}
      <section className="bg-[#FAF9F5] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E4E1D6]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[#2C3E36] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                <span>Verified Living Spaces</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">
                Authentic Rooms & Communal Areas
              </h2>
              <p className="text-[#6B6B63] text-sm max-w-lg mt-1">
                Explore authentic high-resolution images of rooms, workstations, hygienic washrooms, and food mess facilities uploaded by verified hosts.
              </p>
            </div>
            <Link
              href="/seeker"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2C3E36] hover:text-[#1E2B25] transition-colors self-start md:self-auto"
            >
              <span>Browse all 590+ properties</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/boys/hostel-building-main.jpg"
                alt="Premium Living Campus"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Campus & Exterior</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/girls/girls-hostel-services.webp"
                alt="Ladies Residency"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Girls Boutique PG</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/boys/pg-hostels-for-men.jpg"
                alt="Men's Executive Stay"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Men's Executive Stay</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/boys/urban-backpackers-boys-pg.jpg"
                alt="Urban Co-living Hub"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Urban Backpackers</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/boys/youth-hostel-kolkata.jpg"
                alt="Youth Residency"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Youth Residency</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/rooms/room1.png"
                alt="Deluxe AC Single Room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Deluxe AC Single</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/rooms/room2.png"
                alt="Executive Double Sharing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Double Sharing</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/rooms/room3.png"
                alt="Triple Sharing PG Room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Triple Sharing</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/rooms/room4.jpg"
                alt="Study & Workspace Area"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Furnished Studio</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E4E1D6] bg-white aspect-[4/3] shadow-sm hover:border-[#2C3E36] transition-all">
              <img
                src="/images/coed/hostel-room-bunk.jpeg"
                alt="Co-living Bunk Dorm"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-semibold text-white tracking-wide">Bunk Bed Dorm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features with Accent Sand Background Blocks */}
      <section className="bg-[#F3F1E7] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E4E1D6]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#2A2A2A]">Why Seekers Choose Shel</h2>
            <p className="text-[#6B6B63] text-sm max-w-lg mx-auto">Thoughtfully crafted accommodation discovery with zero brokerage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-[#D9D3B8]/50 rounded-2xl border border-[#E4E1D6] space-y-4 shadow-sm hover:bg-[#D9D3B8]/70 transition-all">
              <div className="bg-[#2C3E36] text-[#F3F1E7] p-3 rounded-xl w-fit shadow-sm">
                <Shield size={22} />
              </div>
              <h3 className="font-serif font-bold text-[#2A2A2A] text-xl">Verified Quality Guarantee</h3>
              <p className="text-[#6B6B63] text-sm leading-relaxed">
                Admins thoroughly evaluate property credentials to award the official verification seal for hygiene, safety, and security.
              </p>
            </div>

            <div className="p-8 bg-[#D9D3B8]/50 rounded-2xl border border-[#E4E1D6] space-y-4 shadow-sm hover:bg-[#D9D3B8]/70 transition-all">
              <div className="bg-[#2C3E36] text-[#F3F1E7] p-3 rounded-xl w-fit shadow-sm">
                <Building2 size={22} />
              </div>
              <h3 className="font-serif font-bold text-[#2A2A2A] text-xl">Live Bed Vacancy Tracker</h3>
              <p className="text-[#6B6B63] text-sm leading-relaxed">
                Filter strictly by room sharing tier with guaranteed vacant beds, eliminating wasted site visits and inaccurate listings.
              </p>
            </div>

            <div className="p-8 bg-[#D9D3B8]/50 rounded-2xl border border-[#E4E1D6] space-y-4 shadow-sm hover:bg-[#D9D3B8]/70 transition-all">
              <div className="bg-[#2C3E36] text-[#F3F1E7] p-3 rounded-xl w-fit shadow-sm">
                <UserCheck size={22} />
              </div>
              <h3 className="font-serif font-bold text-[#2A2A2A] text-xl">Multimodal Direct Messaging</h3>
              <p className="text-[#6B6B63] text-sm leading-relaxed">
                Connect directly with property owners via real-time text chat and voice notes without sharing private telephone numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C3E36] text-[#E8E4CF] py-12 px-4 sm:px-6 lg:px-8 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-[#F3F1E7] font-semibold text-base gap-2">
            <img
              src="/logo.png"
              alt="Shel"
              className="w-7 h-7 rounded-full object-cover bg-white p-0.5 border border-[#A9B3AA]/40"
            />
            <span className="font-serif font-bold text-[#F3F1E7]">Shel</span>
            <span className="text-[#A9B3AA]">|</span>
            <span className="text-[#D9D3B8] text-xs font-normal">© 2026 Shel Stays & Co-Living. All rights reserved.</span>
          </div>
          <p className="text-[#A9B3AA]">Handpicked student and professional paying guest residences across India.</p>
        </div>
      </footer>
    </div>
  );
}
