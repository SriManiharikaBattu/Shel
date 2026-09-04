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
    <nav className="bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link href={getDashboardLink()} className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Shel Logo"
                className="w-9 h-9 rounded-full object-cover bg-white p-0.5 border border-slate-700 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Shel
                </span>
                <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase -mt-1">
                  SEARCH
                </span>
              </div>
            </Link>

            {/* Role specific navigation */}
            <div className="hidden sm:ml-4 sm:flex sm:space-x-3">
              {user.role === 'SEEKER' && (
                <>
                  <Link
                    href="/seeker"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Search size={15} className="text-emerald-400" />
                    <span>Explore</span>
                  </Link>
                  <Link
                    href="/seeker/wishlist"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Heart size={15} className="text-rose-400" />
                    <span>Wishlist</span>
                  </Link>
                  <Link
                    href="/seeker/compare"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Columns size={15} className="text-cyan-400" />
                    <span>Compare</span>
                  </Link>
                  <Link
                    href="/seeker/chat"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <MessageSquare size={15} className="text-amber-400" />
                    <span>Chats</span>
                  </Link>
                </>
              )}

              {user.role === 'OWNER' && (
                <>
                  <Link
                    href="/owner"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <Building2 size={15} className="text-emerald-400" />
                    <span>My Properties</span>
                  </Link>
                  <Link
                    href="/owner/enquiries"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <MessageSquare size={15} className="text-amber-400" />
                    <span>Enquiries & Chats</span>
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all gap-1.5"
                  >
                    <ShieldCheck size={15} className="text-emerald-400" />
                    <span>Admin Approvals</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              className="flex items-center space-x-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                <User size={14} />
              </div>
              <span className="hidden md:inline font-semibold">{user.name}</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-xs font-semibold py-1.5 px-3 rounded-xl transition-all"
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
