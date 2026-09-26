'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Mail, Phone, KeyRound, MessageSquare, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, sendOtp } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend OTP Countdown Timer (60s rate limit)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setInfo('');

    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Please enter your email or phone number first.');
      return;
    }

    setLoading(true);
    try {
      const msg = await sendOtp(trimmed);
      setOtpSent(true);
      setResendTimer(60);
      const isEmail = trimmed.includes('@');
      setInfo(
        msg ||
          (isEmail
            ? `We've sent a 6-digit code to your email (${trimmed}). Please check your inbox or spam.`
            : `We've sent a 6-digit code to your mobile number (${trimmed}).`)
      );
    } catch (err: any) {
      setError(err.message || "Couldn't send OTP, please check your contact details or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Please enter your email or phone number.');
      return;
    }
    if (loginMethod === 'PASSWORD' && !password) {
      setError('Please enter your password.');
      return;
    }
    if (loginMethod === 'OTP' && !otp) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await login(
        loginMethod,
        trimmed,
        loginMethod === 'PASSWORD' ? { password } : { otp }
      );
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">Welcome to Shel</h2>
          <p className="mt-1.5 text-xs text-[#6B6B63]">
            Sign in to discover or manage verified accommodations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E4E1D6]">
          <button
            type="button"
            className={`w-1/2 py-2.5 text-xs sm:text-sm font-semibold text-center focus:outline-none transition-all border-b-2 ${
              loginMethod === 'PASSWORD'
                ? 'border-[#2C3E36] text-[#2C3E36]'
                : 'border-transparent text-[#6B6B63] hover:text-[#2A2A2A]'
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
                ? 'border-[#2C3E36] text-[#2C3E36]'
                : 'border-transparent text-[#6B6B63] hover:text-[#2A2A2A]'
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
          <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {info && (
          <div className="p-3 bg-[#D9D3B8]/40 text-[#2C3E36] text-xs rounded-xl border border-[#D9D3B8] flex items-start gap-2">
            <CheckCircle2 size={15} className="text-[#2C3E36] flex-shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={loginMethod === 'OTP' && !otpSent ? handleSendOtp : handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-[#2A2A2A] mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                  {identifier.includes('@') ? <Mail size={16} /> : <Phone size={16} />}
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  disabled={loading || (loginMethod === 'OTP' && otpSent)}
                  className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm disabled:bg-[#F3F1E7] disabled:text-[#6B6B63] transition-all"
                  placeholder="name@email.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {loginMethod === 'PASSWORD' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#2A2A2A]">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-[#2C3E36] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                    <KeyRound size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={loading}
                    className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {loginMethod === 'OTP' && otpSent && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="otp" className="block text-xs font-semibold text-[#2A2A2A]">
                    Enter 6-Digit Verification Code
                  </label>
                  <span className="text-[11px] text-[#6B6B63]">Expires in 5m</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
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
                    className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] focus:border-transparent font-mono tracking-widest text-center text-lg font-bold"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                {/* Resend OTP button & Change Contact link */}
                <div className="flex items-center justify-between mt-2.5 text-xs">
                  <button
                    type="button"
                    disabled={loading || resendTimer > 0}
                    onClick={() => handleSendOtp()}
                    className="font-medium text-[#2C3E36] hover:underline disabled:text-[#6B6B63] disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? (
                      <span>Resend OTP in <strong className="font-mono font-bold text-[#2C3E36]">{resendTimer}s</strong></span>
                    ) : (
                      <span className="font-semibold underline">Resend OTP</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="font-semibold text-[#6B6B63] hover:text-[#2C3E36] hover:underline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setInfo('');
                      setError('');
                    }}
                  >
                    Change Contact Info
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-[#F3F1E7] font-semibold bg-[#2C3E36] hover:bg-[#22312B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3E36] transition-all disabled:opacity-50 shadow-sm text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw size={15} className="animate-spin text-[#F3F1E7]" />
                  <span>Processing...</span>
                </div>
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

        <div className="text-center pt-3 border-t border-[#E4E1D6]">
          <p className="text-xs text-[#6B6B63]">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-bold text-[#2C3E36] hover:underline"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
