'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { User, LogOut, Heart, Columns, MessageSquare, Building2, ShieldCheck, Search } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getDashboardLink = () => {
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'OWNER') return '/owner';
    return '/seeker';
  };

  return (
    <nav className="bg-[#2C3E36] border-b border-[#3D5349] sticky top-0 z-50 text-[#F3F1E7] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link href={getDashboardLink()} className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Shel Logo"
                className="w-9 h-9 rounded-full object-cover bg-white p-0.5 border border-[#A9B3AA]/40 shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold tracking-tight text-[#F3F1E7] group-hover:text-[#D9D3B8] transition-colors">
                  Shel
                </span>
                <span className="text-[9px] font-sans font-semibold tracking-widest text-[#A9B3AA] uppercase -mt-1">
                  COLLECTION
                </span>
              </div>
            </Link>

            {/* Role specific navigation */}
            <div className="hidden sm:ml-4 sm:flex sm:space-x-1">
              {user.role === 'SEEKER' && (
                <>
                  <Link
                    href="/seeker"
                    className="text-[#E8E4CF] hover:text-white hover:bg-[#3D5349]/70 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Search size={15} className="text-[#D9D3B8]" />
                    <span>Explore Stays</span>
                  </Link>
                  <Link
                    href="/seeker/wishlist"
                    className="text-[#E8E4CF] hover:text-white hover:bg-[#3D5349]/70 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Heart size={15} className="text-[#D9D3B8]" />
                    <span>Saved</span>
                  </Link>
                  <Link
                    href="/seeker/compare"
                    className="text-[#E8E4CF] hover:text-white hover:bg-[#3D5349]/70 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Columns size={15} className="text-[#A9B3AA]" />
                    <span>Compare</span>
                  </Link>
                  <Link
                    href="/seeker/chat"
                    className="text-[#E8E4CF] hover:text-white hover:bg-[#3D5349]/70 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <MessageSquare size={15} className="text-[#D9D3B8]" />
                    <span>Messages</span>
                  </Link>
                </>
              )}

              {user.role === 'OWNER' && (
                <>
                  <Link
                    href="/owner"
                    className="text-[#E8E4CF] hover:text-white hover:bg-[#3D5349]/70 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Building2 size={15} className="text-[#D9D3B8]" />
                    <span>My Properties</span>
                  </Link>
                  <Link
                    href="/owner/enquiries"
                    className="text-[#E8E4CF] hover:text-white hover:bg-[#3D5349]/70 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <MessageSquare size={15} className="text-[#A9B3AA]" />
                    <span>Enquiries & Chats</span>
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    className="text-[#E8E4CF] hover:text-white hover:bg-[#3D5349]/70 inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <ShieldCheck size={15} className="text-[#D9D3B8]" />
                    <span>Verification Desk</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              className="flex items-center space-x-2 text-[#F3F1E7] bg-[#3D5349]/70 hover:bg-[#3D5349] border border-[#A9B3AA]/30 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-[#D9D3B8] text-[#2C3E36] flex items-center justify-center font-bold text-xs">
                <User size={14} />
              </div>
              <span className="hidden md:inline font-semibold">{user.name}</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-[#E8E4CF] hover:text-white bg-[#1E2B25] hover:bg-[#15201B] border border-[#3D5349] text-xs font-semibold py-1.5 px-3 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
