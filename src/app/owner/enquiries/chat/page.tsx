'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OwnerChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enquiryId, setEnquiryId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'OWNER')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const id = localStorage.getItem('active_chat_enquiry_id');
    if (id) {
      setEnquiryId(id);
    } else {
      router.push('/owner/enquiries');
    }
  }, [router]);

  if (authLoading || !user || !enquiryId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <RefreshCw className="animate-spin" />
          <span>Opening Chat Window...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-4">
          <Link
            href="/owner/enquiries"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft size={14} /> Back to Enquiries
          </Link>
        </div>

        <ChatWindow
          enquiryId={enquiryId}
          currentUser={{ id: user.id, name: user.name, role: user.role }}
        />
      </main>
    </div>
  );
}
