'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';
import { MessageSquare, RefreshCw, ChevronRight, Inbox, MapPin, Building, ShieldCheck } from 'lucide-react';

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
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-400" />
              <span>Hostel Conversations</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
              {enquiries.length}
            </span>
          </div>

          {enquiries.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-6 text-slate-500">
              <Inbox size={36} />
              <span className="text-xs font-semibold mt-2">No active chats</span>
              <p className="text-[11px] text-slate-500 text-center mt-1">Click the chat icon on any hostel card to talk with the owner.</p>
            </div>
          ) : (
            <div className="space-y-2 flex-grow overflow-y-auto">
              {enquiries.map((enq) => {
                const isSelected = selectedEnquiryId === enq.id;
                const prop = enq.property;
                const cityStateText = `${prop.city || ''}${prop.city && prop.state ? ', ' : ''}${prop.state || ''}`;

                return (
                  <button
                    key={enq.id}
                    onClick={() => setSelectedEnquiryId(enq.id)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border flex items-center justify-between focus:outline-none ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2 space-y-1 w-full">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-sm block truncate text-white">
                          {prop.name}
                        </span>
                        {prop.isVerified && (
                          <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0" title="Verified Hostel" />
                        )}
                      </div>

                      {cityStateText && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 truncate">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span>{cityStateText}</span>
                        </span>
                      )}

                      {prop.owner?.name && (
                        <span className="text-[11px] text-slate-400 block truncate">
                          Owner: <strong className="text-slate-300">{prop.owner.name}</strong>
                        </span>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1">
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {enq.message}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {new Date(enq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`flex-shrink-0 ml-1 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
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
                Pick a thread from the left panel to message or send voice notes to the hostel owner.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
