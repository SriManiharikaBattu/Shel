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
    <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#2C3E36] selection:text-[#F3F1E7]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-[#E4E1D6] text-[#2A2A2A] relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block group mb-3">
            <img
              src="/logo.png"
              alt="Shel Logo"
              className="w-14 h-14 rounded-full mx-auto p-1 bg-white border border-[#E4E1D6] shadow-sm group-hover:scale-105 transition-transform"
            />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">Reset Password</h2>
          <p className="mt-1.5 text-xs text-[#6B6B63]">
            {success
              ? 'Password reset instructions sent'
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-[#D9D3B8]/60 text-[#2C3E36] text-xs rounded-xl border border-[#D9D3B8]">
              <p className="font-serif font-bold text-sm text-[#2C3E36]">Reset Link Sent!</p>
              <p className="mt-1 leading-relaxed">
                We have generated a mock password reset link to <strong>{email}</strong>. 
              </p>
            </div>
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-[#F3F1E7] font-semibold bg-[#2C3E36] hover:bg-[#22312B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3E36] transition-all shadow-sm text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#2A2A2A] mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm transition-all"
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
                className="w-full flex justify-center py-2.5 px-4 rounded-xl text-[#F3F1E7] font-semibold bg-[#2C3E36] hover:bg-[#22312B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3E36] transition-all disabled:opacity-50 shadow-sm text-sm"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center text-xs font-semibold text-[#6B6B63] hover:text-[#2A2A2A] gap-1.5 py-2 transition-colors"
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
