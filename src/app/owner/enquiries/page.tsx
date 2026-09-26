'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { MessageSquare, Check, X, RefreshCw, Clock, Send, MapPin } from 'lucide-react';

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
      router.push('/seeker');
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
      <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7]">
        <div className="flex items-center space-x-2 text-[#2C3E36] font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Loading booking enquiries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F1E7] text-[#2A2A2A] pb-20 font-sans selection:bg-[#2C3E36] selection:text-[#F3F1E7]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2.5 rounded-xl bg-white border border-[#E4E1D6] text-[#2C3E36] shadow-sm">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A2A2A] tracking-tight">Seeker Enquiries & Booking Requests</h1>
            <p className="text-xs text-[#6B6B63]">Manage incoming room inquiries from seekers</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 mb-4 bg-[#A9B3AA]/20 text-[#2C3E36] text-sm rounded-xl border border-[#A9B3AA]">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 mb-4 bg-rose-50 text-rose-800 text-sm rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        {enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#E4E1D6] text-center shadow-sm space-y-3">
            <Clock className="mx-auto text-[#6B6B63]" size={48} />
            <h2 className="text-lg font-serif font-bold text-[#2A2A2A]">No enquiries yet</h2>
            <p className="text-[#6B6B63] text-xs max-w-sm mx-auto leading-relaxed">
              You will receive messages here when seekers send queries for your listed PGs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div key={enq.id} className="bg-white rounded-2xl border border-[#E4E1D6] shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-[#A9B3AA] transition-all">
                
                {/* Seeker / PG Info */}
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-serif font-bold text-[#2A2A2A]">{enq.seeker.name}</span>
                    <span className="text-xs text-[#6B6B63] font-medium">({enq.seeker.gender})</span>
                    <span className="text-[#E4E1D6]">|</span>
                    <span className="text-xs text-[#6B6B63] font-medium">Hostel: <strong className="text-[#2C3E36] font-semibold">{enq.property.name}</strong></span>
                    {(enq.property.city || enq.property.state) && (
                      <span className="text-xs text-[#2C3E36] font-semibold flex items-center gap-1 bg-[#FAF9F5] px-2 py-0.5 rounded-md border border-[#E4E1D6]">
                        <MapPin size={11} />
                        <span>{enq.property.city}{enq.property.state ? `, ${enq.property.state}` : ''}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[#2A2A2A] text-sm font-medium bg-[#FAF9F5] p-3 rounded-xl border border-[#E4E1D6]">
                    "{enq.message}"
                  </p>

                  <div className="flex gap-4 text-xs text-[#6B6B63] font-medium">
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
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#D9D3B8]/60 border border-[#D9D3B8] text-[#2C3E36]">
                        Pending Decision
                      </span>
                    ) : enq.status === 'ACCEPTED' ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#A9B3AA]/30 border border-[#A9B3AA] text-[#2C3E36]">
                        Accepted
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Accept/Reject Buttons */}
                  {enq.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(enq.id, 'ACCEPTED')}
                        className="flex-grow sm:flex-grow-0 p-2 bg-[#2C3E36] hover:bg-[#22312B] text-[#F3F1E7] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center"
                        title="Accept booking request"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(enq.id, 'REJECTED')}
                        className="flex-grow sm:flex-grow-0 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
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
                    className="flex items-center justify-center gap-1.5 py-2 px-4 border border-[#2C3E36] rounded-xl text-xs font-semibold text-[#2C3E36] hover:bg-[#D9D3B8] transition-colors focus:outline-none bg-[#FAF9F5]"
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
