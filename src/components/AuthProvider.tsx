'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  signInWithPhoneNumber,
  signOut,
  ConfirmationResult,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'SEEKER' | 'OWNER' | 'ADMIN';
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (role?: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, otp: string, role?: string) => Promise<void>;
  login: (loginMethod: 'PASSWORD' | 'OTP', identifier: string, credentials: { password?: string; otp?: string }) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Synchronize server session
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Helper to establish JWT session with backend
  const establishSession = async (userData: {
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    role?: string;
    gender?: string;
  }) => {
    const res = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate session with database');
    }

    setUser(data.user);

    // Redirect to respective dashboard
    if (data.user.role === 'ADMIN') {
      router.push('/admin');
    } else if (data.user.role === 'OWNER') {
      router.push('/owner');
    } else {
      router.push('/seeker');
    }
  };

  // 1. Firebase Google Sign-In
  const signInWithGoogle = async (role = 'SEEKER') => {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    await establishSession({
      email: fbUser.email,
      phone: fbUser.phoneNumber,
      name: fbUser.displayName || fbUser.email?.split('@')[0],
      role,
    });
  };

  // 2. Firebase Phone OTP Sign-In
  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string,
    role = 'SEEKER'
  ) => {
    const result = await confirmationResult.confirm(otp);
    const fbUser = result.user;

    await establishSession({
      email: fbUser.email,
      phone: fbUser.phoneNumber,
      name: fbUser.displayName || fbUser.phoneNumber || 'Shel Guest',
      role,
    });
  };

  // Legacy fallback password login
  const login = async (
    loginMethod: 'PASSWORD' | 'OTP',
    identifier: string,
    credentials: { password?: string; otp?: string }
  ) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginMethod, identifier, ...credentials }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setUser(data.user);

    if (data.user.role === 'ADMIN') {
      router.push('/admin');
    } else if (data.user.role === 'OWNER') {
      router.push('/owner');
    } else {
      router.push('/seeker');
    }
  };

  const signup = async (userData: any) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const updateProfile = async (userData: any) => {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Profile update failed');
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        login,
        signup,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
