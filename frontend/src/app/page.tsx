'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/data');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0b1414] text-white">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#14a3a3] border-t-transparent" />
        <p className="text-sm font-medium text-zinc-400">Mengarahkan ke BBKA Analytics Studio...</p>
        <noscript>
          <meta httpEquiv="refresh" content="0;url=/data" />
          <p className="text-xs text-zinc-500 mt-2">
            Klik <a href="/data" className="text-[#14a3a3] underline">di sini</a> jika Anda tidak dialihkan secara otomatis.
          </p>
        </noscript>
      </div>
    </div>
  );
}
