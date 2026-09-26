'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user?.role === 'ADMIN') {
        router.replace('/admin');
      } else if (user?.role === 'OWNER') {
        router.replace('/owner');
      } else {
        router.replace('/seeker');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7]">
      <div className="flex flex-col items-center gap-4 text-[#2C3E36] font-semibold">
        <img
          src="/logo.png"
          alt="Shel"
          className="w-14 h-14 rounded-full p-1 bg-white border-2 border-[#2C3E36] animate-pulse shadow-md"
        />
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-[#2C3E36]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium tracking-wide text-[#6B6B63]">Directing to Dashboard...</span>
        </div>
      </div>
    </div>
  );
}
