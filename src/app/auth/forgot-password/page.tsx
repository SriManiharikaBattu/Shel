'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-6 bg-[#0e1424]/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-800 text-slate-100 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block group mb-3">
            <img
              src="/logo.png"
              alt="Shel Logo"
              className="w-16 h-16 rounded-full mx-auto p-1 bg-white border-2 border-slate-700 shadow-lg group-hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">Reset Password</h2>
          <p className="mt-1 text-xs text-slate-400">
            {success
              ? 'Password reset instructions sent'
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-950/70 text-emerald-300 text-xs rounded-xl border border-emerald-700">
              <p className="font-bold text-sm text-emerald-200">Reset Link Sent!</p>
              <p className="mt-1 leading-relaxed">
                We have generated a mock password reset link to <strong>{email}</strong>. 
              </p>
            </div>
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-md shadow-emerald-500/20 text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 text-sm"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center text-xs font-semibold text-slate-400 hover:text-white gap-1.5 py-2 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
