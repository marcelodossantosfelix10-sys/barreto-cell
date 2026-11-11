'use client';

import dynamic from 'next/dynamic';

const BarretoApp = dynamic(() => import('@/components/BarretoApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
          Carregando Barreto Cell...
        </span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <BarretoApp />;
}
