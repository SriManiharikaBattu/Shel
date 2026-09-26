'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Phone, MessageSquare, RefreshCw, KeyRound, Mail, Sparkles, Shield, Building2, User } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, sendPhoneOtp, verifyPhoneOtp, login } = useAuth();

  // Primary Login Modes: 'GMAIL' | 'PHONE_OTP' | 'PASSWORD'
  const [authMode, setAuthMode] = useState<'GMAIL' | 'PHONE_OTP' | 'PASSWORD'>('GMAIL');
  const [selectedRole, setSelectedRole] = useState<'SEEKER' | 'OWNER'>('SEEKER');

  // Phone OTP States
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Password Login States (Fallback)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // UI Feedback
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Cleanup & Countdown Timer
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

  // Initialize Firebase RecaptchaVerifier
  const getRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return null;

    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try sending OTP again.');
        },
      });
    }
    return recaptchaVerifierRef.current;
  };

  // 1. Handle Google / Gmail Authentication
  const handleGoogleSignIn = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await signInWithGoogle(selectedRole);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setError(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Phone OTP Sending (Firebase Auth)
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setInfo('');

    const cleanNumber = phone.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber.slice(-10)}`;

    setLoading(true);
    try {
      const verifier = getRecaptchaVerifier();
      if (!verifier) throw new Error('reCAPTCHA verifier initialization failed');

      const result = await sendPhoneOtp(fullPhoneNumber, verifier);
      setConfirmationResult(result);
      setResendTimer(60);
      setInfo(`6-digit verification code sent to ${fullPhoneNumber}.`);
    } catch (err: any) {
      console.error('Phone OTP error:', err);
      // Reset reCAPTCHA verifier if error occurred
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (e) {
          // ignore
        }
      }

      if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase SMS is not enabled for India (+91). Please enable "Phone" and allow India (+91) under Firebase Console > Authentication > Settings > SMS region policy, or add a test phone number in Firebase Console.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Please check and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded for Firebase project. Please use Google Sign-in or test numbers.');
      } else if (err.code === 'auth/app-not-authorized') {
        setError('This domain (localhost) is not authorized in Firebase Console. Add "localhost" under Authentication > Settings > Authorized domains.');
      } else {
        setError(err.message || 'Failed to send SMS code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Phone OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!confirmationResult) {
      setError('Please request an OTP code first.');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneOtp(confirmationResult, otp.trim(), selectedRole);
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect verification code. Please check and re-enter.');
      } else if (err.code === 'auth/code-expired') {
        setError('Verification code has expired. Please request a new OTP.');
      } else {
        setError(err.message || 'OTP verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Fallback Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier) {
      setError('Please enter your email or phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login('PASSWORD', identifier.trim(), { password });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7] py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#2C3E36] selection:text-[#F3F1E7]">
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

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
            Fast, secure authentication powered by Firebase
          </p>
        </div>

        {/* Role Selector Pill */}
        <div>
          <label className="block text-[11px] font-semibold text-[#6B6B63] uppercase tracking-wider mb-1.5 text-center">
            Sign In As
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#FAF9F5] p-1 rounded-xl border border-[#E4E1D6]">
            <button
              type="button"
              onClick={() => setSelectedRole('SEEKER')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'SEEKER'
                  ? 'bg-[#2C3E36] text-[#F3F1E7] shadow-sm'
                  : 'text-[#6B6B63] hover:text-[#2A2A2A]'
              }`}
            >
              <User size={14} />
              <span>Guest / Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('OWNER')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'OWNER'
                  ? 'bg-[#2C3E36] text-[#F3F1E7] shadow-sm'
                  : 'text-[#6B6B63] hover:text-[#2A2A2A]'
              }`}
            >
              <Building2 size={14} />
              <span>Hostel Owner</span>
            </button>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex border-b border-[#E4E1D6]">
          <button
            type="button"
            className={`w-1/2 py-2.5 text-xs sm:text-sm font-semibold text-center focus:outline-none transition-all border-b-2 ${
              authMode === 'GMAIL'
                ? 'border-[#2C3E36] text-[#2C3E36]'
                : 'border-transparent text-[#6B6B63] hover:text-[#2A2A2A]'
            }`}
            onClick={() => {
              setAuthMode('GMAIL');
              setError('');
              setInfo('');
            }}
          >
            Google Sign-In
          </button>
          <button
            type="button"
            className={`w-1/2 py-2.5 text-xs sm:text-sm font-semibold text-center focus:outline-none transition-all border-b-2 ${
              authMode === 'PHONE_OTP'
                ? 'border-[#2C3E36] text-[#2C3E36]'
                : 'border-transparent text-[#6B6B63] hover:text-[#2A2A2A]'
            }`}
            onClick={() => {
              setAuthMode('PHONE_OTP');
              setError('');
              setInfo('');
            }}
          >
            Phone & OTP
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {info && (
          <div className="p-3 bg-[#D9D3B8]/40 text-[#2C3E36] text-xs rounded-xl border border-[#D9D3B8] flex items-center gap-2">
            <Sparkles size={14} className="text-[#2C3E36] flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}

        {/* 1. GMAIL / GOOGLE SIGN-IN MODE */}
        {authMode === 'GMAIL' && (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#6B6B63] text-center">
              Continue using your verified Google / Gmail account with one click.
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#E4E1D6] bg-[#FAF9F5] hover:bg-white text-[#2A2A2A] font-semibold text-sm shadow-sm transition-all hover:border-[#2C3E36] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2 text-[#2C3E36]">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 2. PHONE & SMS OTP (FIREBASE AUTH) */}
        {authMode === 'PHONE_OTP' && (
          <div className="space-y-4 pt-1">
            {!confirmationResult ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-[#2A2A2A] mb-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="w-20 flex-shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full px-2 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] rounded-xl text-xs font-semibold text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36]"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                      </select>
                    </div>
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                        <Phone size={16} />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        required
                        disabled={loading}
                        className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] text-sm"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl text-[#F3F1E7] font-semibold bg-[#2C3E36] hover:bg-[#22312B] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] transition-all disabled:opacity-50 text-sm shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw size={15} className="animate-spin text-[#F3F1E7]" />
                      <span>Sending SMS Code...</span>
                    </div>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="otp" className="block text-xs font-semibold text-[#2A2A2A]">
                      Enter 6-Digit SMS Code
                    </label>
                    <span className="text-[11px] text-[#6B6B63]">Sent to {countryCode} {phone}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                      <MessageSquare size={16} />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      autoFocus
                      disabled={loading}
                      className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] font-mono tracking-widest text-center text-lg font-bold"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs">
                    <button
                      type="button"
                      disabled={loading || resendTimer > 0}
                      onClick={() => handleSendPhoneOtp()}
                      className="font-medium text-[#2C3E36] hover:underline disabled:text-[#6B6B63] disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? (
                        <span>Resend SMS in <strong className="font-mono">{resendTimer}s</strong></span>
                      ) : (
                        <span className="font-semibold underline">Resend SMS Code</span>
                      )}
                    </button>

                    <button
                      type="button"
                      className="font-semibold text-[#6B6B63] hover:text-[#2C3E36] hover:underline"
                      onClick={() => {
                        setConfirmationResult(null);
                        setOtp('');
                        setError('');
                        setInfo('');
                      }}
                    >
                      Change Number
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl text-[#F3F1E7] font-semibold bg-[#2C3E36] hover:bg-[#22312B] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] transition-all disabled:opacity-50 text-sm shadow-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw size={15} className="animate-spin text-[#F3F1E7]" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. FALLBACK PASSWORD LOGIN */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1">
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-[#2A2A2A] mb-1">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                  {identifier.includes('@') ? <Mail size={16} /> : <Phone size={16} />}
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  disabled={loading}
                  className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] text-sm"
                  placeholder="admin@pgfinder.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-xs font-semibold text-[#2A2A2A]">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-medium text-[#2C3E36] hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B6B63]">
                  <KeyRound size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  disabled={loading}
                  className="rounded-xl block w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E4E1D6] placeholder-[#6B6B63]/60 text-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-[#F3F1E7] font-semibold bg-[#2C3E36] hover:bg-[#22312B] focus:outline-none focus:ring-2 focus:ring-[#2C3E36] transition-all disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? <span>Signing In...</span> : <span>Sign In with Password</span>}
            </button>
          </form>
        )}

        {/* Mode Toggle Footer */}
        <div className="text-center pt-2">
          {authMode !== 'PASSWORD' ? (
            <button
              type="button"
              onClick={() => setAuthMode('PASSWORD')}
              className="text-xs font-medium text-[#6B6B63] hover:text-[#2C3E36] hover:underline"
            >
              Or sign in using test account password →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode('GMAIL')}
              className="text-xs font-medium text-[#6B6B63] hover:text-[#2C3E36] hover:underline"
            >
              ← Return to Google / Phone OTP Sign-In
            </button>
          )}
        </div>

        <div className="text-center pt-3 border-t border-[#E4E1D6]">
          <p className="text-xs text-[#6B6B63]">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-bold text-[#2C3E36] hover:underline">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
