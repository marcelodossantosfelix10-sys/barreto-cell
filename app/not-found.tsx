import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold text-2xl mb-4 shadow-lg">
        404
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Página não encontrada</h1>
      <p className="text-xs text-slate-400 mb-6 max-w-sm">
        O endereço que você tentou acessar não existe ou foi alterado.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs transition-colors"
      >
        Voltar para a Barreto Cell
      </Link>
    </div>
  );
}
