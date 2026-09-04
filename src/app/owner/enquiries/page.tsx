'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { MessageSquare, Check, X, RefreshCw, Clock, Send } from 'lucide-react';

export default function OwnerEnquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owner/enquiries');
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'OWNER')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEnquiries();
    }
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/owner/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
        setSuccessMsg(`Booking request status updated to ${newStatus}.`);
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update status.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Error updating status.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Loading booking enquiries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-20 font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Seeker Enquiries & Booking Requests</h1>
            <p className="text-xs text-slate-400">Manage incoming room inquiries from seekers</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-950/70 text-emerald-300 text-sm rounded-xl border border-emerald-800">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-950/70 text-rose-300 text-sm rounded-xl border border-rose-800">
            {errorMsg}
          </div>
        )}

        {enquiries.length === 0 ? (
          <div className="bg-[#0e1424] rounded-2xl p-12 border border-slate-800 text-center shadow-xl space-y-3">
            <Clock className="mx-auto text-slate-600" size={48} />
            <h2 className="text-lg font-bold text-white">No enquiries yet</h2>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              You will receive messages here when seekers send queries for your listed PGs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div key={enq.id} className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Seeker / PG Info */}
                <div className="space-y-2.5 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{enq.seeker.name}</span>
                    <span className="text-xs text-slate-400 font-medium">({enq.seeker.gender})</span>
                    <span className="text-slate-700">|</span>
                    <span className="text-xs text-slate-400 font-medium">PG: <strong className="text-emerald-400">{enq.property.name}</strong></span>
                  </div>

                  <p className="text-slate-300 text-sm font-medium bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    "{enq.message}"
                  </p>

                  <div className="flex gap-4 text-xs text-slate-500 font-medium">
                    <span>Email: {enq.seeker.email}</span>
                    <span>Phone: {enq.seeker.phone}</span>
                    <span>Date: {new Date(enq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Indicator & Reply Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 flex-shrink-0 w-full md:w-auto">
                  {/* Status Badge */}
                  <div className="text-center md:text-right">
                    {enq.status === 'PENDING' ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300">
                        Pending Decision
                      </span>
                    ) : enq.status === 'ACCEPTED' ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-300">
                        Accepted
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-950/80 border border-rose-800 text-rose-300">
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Accept/Reject Buttons */}
                  {enq.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(enq.id, 'ACCEPTED')}
                        className="flex-grow sm:flex-grow-0 p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center"
                        title="Accept booking request"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(enq.id, 'REJECTED')}
                        className="flex-grow sm:flex-grow-0 p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md flex items-center justify-center"
                        title="Reject booking request"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  {/* Open Chat Action */}
                  <button
                    onClick={() => {
                      localStorage.setItem('active_chat_enquiry_id', enq.id);
                      router.push('/owner/enquiries/chat');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-4 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-950/60 transition-colors focus:outline-none bg-emerald-950/30"
                  >
                    <Send size={14} />
                    <span>In-App Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
