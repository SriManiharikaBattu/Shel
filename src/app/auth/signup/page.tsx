'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { User, Mail, Phone, Lock, Eye, EyeOff, Building2, Search } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [role, setRole] = useState<'SEEKER' | 'OWNER'>('SEEKER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !password || !gender || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, phone, password, gender, role });
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">Create Account</h2>
          <p className="mt-1.5 text-xs text-[#6B6B63]">Join Shel to find or list verified hostels across India</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {/* Quick Google Sign In */}
        <div className="space-y-3">
          {/* Role selection toggle */}
          <div>
            <span className="block text-xs font-semibold text-[#2A2A2A] mb-1.5">I want to register as:</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  role === 'SEEKER'
                    ? 'bg-[#2C3E36] border-[#2C3E36] text-[#F3F1E7] shadow-sm'
                    : 'bg-[#FAF9F5] border-[#E4E1D6] text-[#6B6B63] hover:text-[#2A2A2A] hover:bg-[#F3F1E7]'
                }`}
                onClick={() => setRole('SEEKER')}
              >
                <Search size={14} className={role === 'SEEKER' ? 'text-[#D9D3B8]' : 'text-[#6B6B63]'} />
                <span>Seeker (Find PG)</span>
              </button>
              <button
                type="button"
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  role === 'OWNER'
                    ? 'bg-[#2C3E36] border-[#2C3E36] text-[#F3F1E7] shadow-sm'
                    : 'bg-[#FAF9F5] border-[#E4E1D6] text-[#6B6B63] hover:text-[#2A2A2A] hover:bg-[#F3F1E7]'
                }`}
                onClick={() => setRole('OWNER')}
              >
                <Building2 size={14} className={role === 'OWNER' ? 'text-[#D9D3B8]' : 'text-[#6B6B63]'} />
                <span>Owner (List PG)</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setError('');
              setLoading(true);
              try {
                await signInWithGoogle(role);
              } catch (e: any) {
                if (e.code === 'auth/popup-closed-by-user') {
                  setError('Sign-up popup was closed. Please try again.');
                } else if (e.code === 'auth/cancelled-popup-request') {
                  // Ignored
                } else {
                  setError(e.message || 'Google registration failed. Please try again.');
                }
              } finally {
                setLoading(false);
              }
            }}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E4E1D6] bg-[#FAF9F5] hover:bg-white text-[#2A2A2A] font-semibold text-xs sm:text-sm shadow-sm transition-all hover:border-[#2C3E36] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Instant Sign Up with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E4E1D6] w-full"></div>
            <span className="bg-white px-3 text-[11px] text-[#6B6B63] uppercase tracking-wider relative">Or register manually</span>
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-[#2A2A2A] mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                <User size={16} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={loading}
                className="rounded-xl block w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Gender selection */}
          <div>
            <label className="block text-xs font-semibold text-[#2A2A2A] mb-1">Gender</label>
            <select
              className="block w-full px-3 py-2 border border-[#E4E1D6] rounded-xl text-[#2A2A2A] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm transition-all"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              disabled={loading}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Email */}
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
                className="rounded-xl block w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm transition-all"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-[#2A2A2A] mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                <Phone size={16} />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                pattern="[0-9]*"
                maxLength={10}
                required
                disabled={loading}
                className="rounded-xl block w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm transition-all"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-[#2A2A2A] mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                <Lock size={16} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                className="rounded-xl block w-full pl-9 pr-10 py-2 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B6B63] hover:text-[#2A2A2A] focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-[#F3F1E7] font-semibold bg-[#2C3E36] hover:bg-[#22312B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3E36] transition-all disabled:opacity-50 shadow-sm text-sm"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center pt-3 border-t border-[#E4E1D6]">
          <p className="text-xs text-[#6B6B63]">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-bold text-[#2C3E36] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
