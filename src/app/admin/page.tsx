'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Check, X, RefreshCw, Trash2, ToggleLeft, ToggleRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owner/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAllProperties();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Opening Admin Control Panel...</span>
        </div>
      </div>
    );
  }

  // Toggle verification status (Admin only action)
  const handleToggleVerification = async (id: string, currentVerified: boolean) => {
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/owner/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentVerified }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isVerified: !currentVerified } : p))
        );
        setSuccessMsg(`Property verification status ${!currentVerified ? 'granted' : 'revoked'}.`);
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle active/inactive status
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/owner/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p))
        );
        setSuccessMsg(`Listing status updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete property
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this PG listing from the system?')) return;
    try {
      const res = await fetch(`/api/owner/properties/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setSuccessMsg('Property listing removed by admin.');
        setTimeout(() => setSuccessMsg(''), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Summary stats
  const totalListings = properties.length;
  const verifiedListings = properties.filter((p) => p.isVerified).length;
  const pendingVerifications = totalListings - verifiedListings;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-400" />
            <span>Admin Approvals Panel</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Approve, verify, or deactivate property listings in the Shel system.</p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/70 text-emerald-300 text-sm rounded-xl border border-emerald-800">
            {successMsg}
          </div>
        )}

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#0e1424] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Listings System</span>
            <span className="block text-3xl font-black text-white mt-1">{totalListings}</span>
          </div>

          <div className="bg-[#0e1424] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Listings</span>
            <span className="block text-3xl font-black text-emerald-400 mt-1">{verifiedListings}</span>
          </div>

          <div className="bg-[#0e1424] p-5 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Verification</span>
            <span className="block text-3xl font-black text-amber-400 mt-1">{pendingVerifications}</span>
          </div>
        </section>

        {/* Listings Table */}
        <section className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-slate-900/60">
            <h2 className="font-bold text-white text-base">Hostel Listings Verification Pipeline</h2>
          </div>

          {properties.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-medium text-xs">
              No PGs registered in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">AC Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Badge</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0e1424] divide-y divide-slate-800/80">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-900/40">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white">{prop.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[250px]">{prop.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                        {prop.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className="px-2 py-0.5 rounded font-bold uppercase bg-slate-800 border border-slate-700 text-slate-200">
                          {prop.genderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-cyan-300 font-semibold uppercase">
                        {prop.acType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(prop.id, prop.isActive)}
                          className={`text-sm font-semibold flex items-center gap-1 focus:outline-none ${
                            prop.isActive ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        >
                          {prop.isActive ? (
                            <>
                              <ToggleRight className="stroke-[2.5]" size={24} />
                              <span className="text-xs">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="stroke-[2.5]" size={24} />
                              <span className="text-xs">Hidden</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prop.isVerified ? (
                          <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/80 py-1 px-2.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-400" /> Verified
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-700/80 py-1 px-2.5 rounded-full inline-flex items-center gap-1">
                            <ShieldAlert size={12} className="text-amber-400" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        {/* Verify/Unverify Toggle CTA */}
                        <button
                          onClick={() => handleToggleVerification(prop.id, prop.isVerified)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            prop.isVerified
                              ? 'border border-rose-900/80 text-rose-400 hover:bg-rose-950/50'
                              : 'border border-emerald-700 text-emerald-300 hover:bg-emerald-950/60'
                          }`}
                        >
                          {prop.isVerified ? 'Revoke Verify' : 'Grant Verify'}
                        </button>

                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-1 border border-rose-900/60 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors inline-flex items-center justify-center align-middle"
                          title="Delete PG permanently"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
