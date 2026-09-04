'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { User, Mail, Phone, Lock, Save, RefreshCw } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setGender(user.gender);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !phone) {
      setError('Name, Email, and Phone number are required.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name,
        email,
        phone,
        gender,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      setSuccess('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-[#0e1424] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-6 text-white">
            <h1 className="text-2xl font-black tracking-tight">Edit Profile</h1>
            <p className="text-slate-400 text-xs mt-1">Manage your Shel personal credentials and security settings</p>
          </div>

          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-950/60 text-rose-300 text-xs rounded-xl border border-rose-800/80">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-950/60 text-emerald-300 text-xs rounded-xl border border-emerald-800/80">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Type (ReadOnly) */}
              <div className="md:col-span-2 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Role</span>
                <span className="block font-black text-white text-lg mt-0.5">
                  {user.role === 'ADMIN' ? 'Super Admin' : user.role === 'OWNER' ? 'Property Owner' : 'PG Seeker'}
                </span>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-9 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  className="block w-full px-3 py-2 border border-slate-700/80 rounded-xl text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-9 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    className="block w-full pl-9 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            <div>
              <h3 className="text-base font-bold text-white">Change Password</h3>
              <p className="text-slate-400 text-xs mt-0.5">Leave blank if you do not want to modify your password</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      className="block w-full pl-9 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      className="block w-full pl-9 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      className="block w-full pl-9 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-slate-950 font-bold bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 text-sm"
              >
                <Save size={16} />
                <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
