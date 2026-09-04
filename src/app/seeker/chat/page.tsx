'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';
import { MessageSquare, RefreshCw, ChevronRight, Inbox } from 'lucide-react';

export default function SeekerChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/seeker/enquiries');
      if (res.ok) {
        const data = await res.json();
        const list = data.enquiries || [];
        setEnquiries(list);

        // Pre-select enquiry if stored in local storage
        const activeId = localStorage.getItem('active_chat_enquiry_id');
        if (activeId && list.some((e: any) => e.id === activeId)) {
          setSelectedEnquiryId(activeId);
          localStorage.removeItem('active_chat_enquiry_id');
        } else if (list.length > 0) {
          setSelectedEnquiryId(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'SEEKER')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchEnquiries();
    }
  }, [user]);

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Opening Chat Panel...</span>
        </div>
      </div>
    );
  }

  const activeEnquiry = enquiries.find((e) => e.id === selectedEnquiryId);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
        {/* Sidebar Left: Enquiries list */}
        <div className="w-full md:w-1/3 bg-[#0e1424] rounded-2xl border border-slate-800 shadow-xl p-4 flex flex-col overflow-y-auto h-[calc(100vh-16rem)]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-base font-bold text-white">Conversations</h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
              {enquiries.length}
            </span>
          </div>
          {enquiries.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-slate-500">
              <Inbox size={36} />
              <span className="text-xs font-semibold mt-2">No active chats</span>
            </div>
          ) : (
            <div className="space-y-1.5 flex-grow overflow-y-auto">
              {enquiries.map((enq) => (
                <button
                  key={enq.id}
                  onClick={() => setSelectedEnquiryId(enq.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all border flex items-center justify-between focus:outline-none ${
                    selectedEnquiryId === enq.id
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-extrabold text-sm block truncate text-white">
                      {enq.property.name}
                    </span>
                    <span className="text-slate-400 text-xs truncate block mt-0.5">
                      {enq.message}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-1 font-semibold">
                      Status:{' '}
                      <strong className={
                        enq.status === 'ACCEPTED' ? 'text-emerald-400' :
                        enq.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'
                      }>
                        {enq.status}
                      </strong>
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window Right */}
        <div className="w-full md:w-2/3">
          {selectedEnquiryId && activeEnquiry ? (
            <ChatWindow
              enquiryId={selectedEnquiryId}
              currentUser={{ id: user.id, name: user.name, role: user.role }}
            />
          ) : (
            <div className="bg-[#0e1424] rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center p-12 h-[calc(100vh-16rem)]">
              <MessageSquare size={48} className="text-slate-600 stroke-[1.5]" />
              <h3 className="font-bold text-white text-base mt-4">Select a conversation</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm font-medium">
                Pick a thread from the left panel to message the property manager.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
