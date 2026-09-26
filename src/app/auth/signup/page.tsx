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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
