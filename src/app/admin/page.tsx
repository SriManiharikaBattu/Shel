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
      <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7]">
        <div className="flex items-center space-x-3 text-[#2C3E36] font-medium text-sm">
          <RefreshCw className="animate-spin text-[#2C3E36]" size={20} />
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
    <div className="min-h-screen bg-[#F3F1E7] text-[#2A2A2A] pb-24 font-sans selection:bg-[#2C3E36] selection:text-[#F3F1E7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[#2C3E36] flex items-center gap-2.5">
            <ShieldCheck className="text-[#2C3E36]" size={28} />
            <span>Admin Approvals Panel</span>
          </h1>
          <p className="text-[#6B6B63] text-sm mt-1">Approve, verify, or manage property listings across the sanctuary directory.</p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-[#D9D3B8]/50 text-[#2C3E36] text-sm rounded-xl border border-[#D9D3B8] font-medium">
            {successMsg}
          </div>
        )}

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E4E1D6] shadow-sm">
            <span className="text-[11px] text-[#6B6B63] font-semibold uppercase tracking-wider">Total Listings System</span>
            <span className="block text-3xl font-serif font-semibold text-[#2C3E36] mt-2">{totalListings}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E4E1D6] shadow-sm">
            <span className="text-[11px] text-[#6B6B63] font-semibold uppercase tracking-wider">Verified Listings</span>
            <span className="block text-3xl font-serif font-semibold text-[#2C3E36] mt-2">{verifiedListings}</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E4E1D6] shadow-sm">
            <span className="text-[11px] text-[#6B6B63] font-semibold uppercase tracking-wider">Pending Verification</span>
            <span className="block text-3xl font-serif font-semibold text-[#B87D4B] mt-2">{pendingVerifications}</span>
          </div>
        </section>

        {/* Listings Table */}
        <section className="bg-white rounded-2xl border border-[#E4E1D6] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E4E1D6] bg-[#FAF9F5]">
            <h2 className="font-serif font-semibold text-[#2C3E36] text-lg">Hostel Listings Verification Pipeline</h2>
          </div>

          {properties.length === 0 ? (
            <div className="p-12 text-center text-[#6B6B63] font-normal text-sm">
              No stays currently registered in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E4E1D6]">
                <thead className="bg-[#FAF9F5]">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">City</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">AC Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">Verification Badge</th>
                    <th className="px-6 py-3.5 text-center text-xs font-semibold text-[#6B6B63] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E4E1D6]">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#2A2A2A]">{prop.name}</div>
                        <div className="text-xs text-[#6B6B63] truncate max-w-[250px] mt-0.5">{prop.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2A2A2A]">
                        {prop.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className="px-2.5 py-1 rounded-full font-medium text-[11px] uppercase bg-[#FAF9F5] border border-[#E4E1D6] text-[#2C3E36]">
                          {prop.genderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-[#2C3E36] font-medium uppercase">
                        {prop.acType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(prop.id, prop.isActive)}
                          className={`text-sm font-medium flex items-center gap-1.5 focus:outline-none transition-colors ${
                            prop.isActive ? 'text-[#2C3E36]' : 'text-[#6B6B63]'
                          }`}
                        >
                          {prop.isActive ? (
                            <>
                              <ToggleRight className="stroke-[2.2] text-[#2C3E36]" size={24} />
                              <span className="text-xs font-medium text-[#2C3E36]">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="stroke-[2.2] text-[#6B6B63]" size={24} />
                              <span className="text-xs text-[#6B6B63]">Hidden</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prop.isVerified ? (
                          <span className="text-xs font-medium text-[#2C3E36] bg-[#D9D3B8]/60 border border-[#D9D3B8] py-1 px-3 rounded-full inline-flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-[#2C3E36]" /> Verified
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-[#8B6B3E] bg-[#F4EDE2] border border-[#E4DAC8] py-1 px-3 rounded-full inline-flex items-center gap-1.5">
                            <ShieldAlert size={13} className="text-[#8B6B3E]" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        {/* Verify/Unverify Toggle CTA */}
                        <button
                          onClick={() => handleToggleVerification(prop.id, prop.isVerified)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            prop.isVerified
                              ? 'border border-[#C88A8A] text-[#9E3E3E] hover:bg-[#FDF2F2]'
                              : 'bg-[#2C3E36] text-[#F3F1E7] hover:bg-[#23322B]'
                          }`}
                        >
                          {prop.isVerified ? 'Revoke Verify' : 'Grant Verify'}
                        </button>

                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-1.5 border border-[#E4E1D6] rounded-lg text-[#6B6B63] hover:text-[#9E3E3E] hover:border-[#C88A8A] hover:bg-[#FDF2F2] transition-colors inline-flex items-center justify-center align-middle"
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
