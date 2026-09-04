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
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
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
          <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
          <p className="mt-1 text-xs text-slate-400">Join Shel to find or list verified hostels across India</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 text-rose-300 text-xs rounded-xl border border-rose-800/80">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Role selection toggle */}
          <div>
            <span className="block text-xs font-semibold text-slate-300 mb-1.5">I want to register as:</span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  role === 'SEEKER'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                onClick={() => setRole('SEEKER')}
              >
                <Search size={14} className={role === 'SEEKER' ? 'text-emerald-400' : 'text-slate-500'} />
                <span>Seeker (Find PG)</span>
              </button>
              <button
                type="button"
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  role === 'OWNER'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                onClick={() => setRole('OWNER')}
              >
                <Building2 size={14} className={role === 'OWNER' ? 'text-emerald-400' : 'text-slate-500'} />
                <span>Owner (List PG)</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={loading}
                className="rounded-xl block w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Gender selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
            <select
              className="block w-full px-3 py-2 border border-slate-700/80 rounded-xl text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
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
                className="rounded-xl block w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                className="rounded-xl block w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                className="rounded-xl block w-full pl-9 pr-10 py-2 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
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
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 text-sm"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
