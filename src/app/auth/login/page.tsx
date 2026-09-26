'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/seeker');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F1E7]">
      <div className="text-center font-medium text-[#2C3E36]">
        Redirecting to dashboard...
      </div>
    </div>
  );
}
