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
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-4 text-emerald-400 font-semibold">
          <img
            src="/logo.png"
            alt="Shel"
            className="w-14 h-14 rounded-full p-1 bg-white border-2 border-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20"
          />
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium tracking-wide text-slate-300">Loading Shel...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Shel Logo"
              className="w-10 h-10 rounded-full object-cover bg-white p-0.5 border border-slate-700 shadow-md group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Shel
              </span>
              <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase -mt-1">
                SEARCH
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60 flex-grow flex items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/80 via-[#090d16] to-[#090d16]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-7 z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm shadow-sm">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Discover Verified Living Accommodations</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Find Your Ideal Space with <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Shel Search.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Explore verified private PGs, hostels, and premium co-living spaces with live bed vacancies, accurate distance calculations, and instant in-app owner chats.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 max-w-md mx-auto">
            <Link
              href="/seeker"
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all text-base"
            >
              <Search size={18} />
              <span>Explore Hostels</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/owner"
              className="flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold py-3.5 px-6 rounded-xl shadow-sm transition-all text-base hover:border-slate-600"
            >
              <Building2 size={18} className="text-emerald-400" />
              <span>List Your Property</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Hostels Gallery Showcase */}
      <section className="bg-[#0e1424]/60 py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                <span>Real Accommodations Across India</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Authentic Room & Living Spaces
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mt-1">
                Explore real photos of rooms, study desks, hygienic washrooms, and food mess facilities uploaded by verified property owners.
              </p>
            </div>
            <Link
              href="/seeker"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors self-start md:self-auto"
            >
              <span>Browse all 400+ properties</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/boys/hostel-building-main.jpg"
                alt="Premium Living Campus"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Campus & Exterior</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/girls/girls-hostel-services.webp"
                alt="Ladies Residency"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Girls Premium PG</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/boys/pg-hostels-for-men.jpg"
                alt="Men's Executive Stay"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Boys Modern Stay</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/boys/urban-backpackers-boys-pg.jpg"
                alt="Urban Co-living Hub"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Urban Backpackers</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/boys/youth-hostel-kolkata.jpg"
                alt="Youth Residency"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Youth Residency</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/rooms/room1.png"
                alt="Deluxe AC Single Room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Deluxe AC Single</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/rooms/room2.png"
                alt="Executive Double Sharing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Double Sharing</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/rooms/room3.png"
                alt="Triple Sharing PG Room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Triple Sharing</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/rooms/room4.jpg"
                alt="Study & Workspace Area"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Furnished Studio</span>
              </div>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] shadow-md hover:border-emerald-500/50 transition-all">
              <img
                src="/images/coed/hostel-room-bunk.jpeg"
                alt="Co-living Bunk Dorm"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white tracking-wide">Bunk Bed Dorm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features */}
      <section className="bg-[#0b0f19] py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Choose Shel?</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">Seamless hostel hunting with zero brokerage and total transparency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 hover:bg-slate-900/90 transition-all">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit border border-emerald-500/20">
                <Shield size={24} />
              </div>
              <h3 className="font-bold text-white text-lg">Verified Badge System</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Admins inspect property credentials and award the verified badge to authentic, high-standard student and professional hostels.
              </p>
            </div>

            <div className="p-7 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 hover:bg-slate-900/90 transition-all">
              <div className="bg-cyan-500/10 text-cyan-400 p-3 rounded-xl w-fit border border-cyan-500/20">
                <Building2 size={24} />
              </div>
              <h3 className="font-bold text-white text-lg">Live Bed Vacancy Counter</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No more guessing. Owners update bed availabilities in real-time, allowing you to instantly filter rooms with immediate vacancies.
              </p>
            </div>

            <div className="p-7 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 hover:bg-slate-900/90 transition-all">
              <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl w-fit border border-amber-500/20">
                <UserCheck size={24} />
              </div>
              <h3 className="font-bold text-white text-lg">Direct In-App Messaging</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect directly with property managers without exposing personal contact details to random browsers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#070a12] text-slate-400 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-white font-extrabold text-base gap-2">
            <img
              src="/logo.png"
              alt="Shel"
              className="w-6 h-6 rounded-full object-cover bg-white p-0.5 border border-slate-700"
            />
            <span className="text-white font-bold">Shel</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 text-xs font-normal">© 2026 Shel Search. All rights reserved.</span>
          </div>
          <p className="text-slate-500">Find and book verified paying guest accommodations across India.</p>
        </div>
      </footer>
    </div>
  );
}
