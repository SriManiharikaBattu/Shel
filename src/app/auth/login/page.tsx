'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Mail, Phone, KeyRound, MessageSquare } from 'lucide-react';

export default function LoginPage() {
  const { login, sendOtp } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtpMsg, setMockOtpMsg] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!identifier) {
      setError('Please enter your email or phone number first.');
      return;
    }
    setLoading(true);
    try {
      const generatedOtp = await sendOtp(identifier);
      setOtpSent(true);
      setMockOtpMsg(`Simulated OTP sent! Use code: ${generatedOtp}`);
      setInfo('A verification code has been generated. See banner below.');
    } catch (err: any) {
      setError(err.message || 'User not found. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier) {
      setError('Please enter your email or phone number.');
      return;
    }
    if (loginMethod === 'PASSWORD' && !password) {
      setError('Please enter your password.');
      return;
    }
    if (loginMethod === 'OTP' && !otp) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      await login(
        loginMethod,
        identifier,
        loginMethod === 'PASSWORD' ? { password } : { otp }
      );
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome to Shel</h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to discover or manage verified accommodations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            className={`w-1/2 py-2.5 text-xs sm:text-sm font-semibold text-center focus:outline-none transition-all border-b-2 ${
              loginMethod === 'PASSWORD'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => {
              setLoginMethod('PASSWORD');
              setError('');
              setInfo('');
            }}
          >
            Password Login
          </button>
          <button
            type="button"
            className={`w-1/2 py-2.5 text-xs sm:text-sm font-semibold text-center focus:outline-none transition-all border-b-2 ${
              loginMethod === 'OTP'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => {
              setLoginMethod('OTP');
              setError('');
              setInfo('');
            }}
          >
            OTP Login (Fast)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 text-rose-300 text-xs rounded-xl border border-rose-800/80">
            {error}
          </div>
        )}

        {info && (
          <div className="p-3 bg-cyan-950/60 text-cyan-300 text-xs rounded-xl border border-cyan-800/80">
            {info}
          </div>
        )}

        {mockOtpMsg && loginMethod === 'OTP' && (
          <div className="p-3.5 bg-emerald-950/70 text-emerald-300 text-xs rounded-xl border border-emerald-700 font-mono text-center font-bold">
            {mockOtpMsg}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={loginMethod === 'OTP' && !otpSent ? handleSendOtp : handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {identifier.includes('@') ? <Mail size={16} /> : <Phone size={16} />}
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  disabled={loading || (loginMethod === 'OTP' && otpSent)}
                  className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm disabled:bg-slate-950 disabled:text-slate-500 transition-all"
                  placeholder="name@email.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {loginMethod === 'PASSWORD' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={loading}
                    className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {loginMethod === 'OTP' && otpSent && (
              <div>
                <label htmlFor="otp" className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MessageSquare size={16} />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    disabled={loading}
                    className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono tracking-widest text-center text-lg font-bold"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 text-sm"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : loginMethod === 'OTP' ? (
                otpSent ? (
                  <span>Verify & Login</span>
                ) : (
                  <span>Send OTP</span>
                )
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>

        {loginMethod === 'OTP' && otpSent && (
          <div className="text-center">
            <button
              type="button"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setMockOtpMsg('');
                setInfo('');
              }}
            >
              Change Contact Info
            </button>
          </div>
        )}

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
