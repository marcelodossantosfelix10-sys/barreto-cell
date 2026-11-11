'use client';

import React from 'react';
import { Plus, Settings, Download, Upload, Smartphone } from 'lucide-react';

import { StoreSettings } from '../lib/types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewBudget: () => void;
  onOpenSettings: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onOpenMobileGuide?: () => void;
  settings?: StoreSettings;
}

export default function Header({
  activeTab,
  setActiveTab,
  onNewBudget,
  onOpenSettings,
  onExportBackup,
  onImportBackup,
  onOpenMobileGuide,
  settings,
}: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Lucro & Finanças' },
    { id: 'budgets', label: 'Orçamentos & OS' },
    { id: 'expenses', label: 'Despesas' },
    { id: 'stock', label: 'Estoque' },
    { id: 'calculator', label: 'Calculadora de Margem' },
  ];

  const logoSrc = settings?.logoUrl || '/images/barreto_cell_logo.jpg';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand mark with logo image */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-cyan-500/40 shadow-md shadow-cyan-500/20 bg-slate-950 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt={settings?.storeName || 'Barreto Cell'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap block leading-tight">
                  {settings?.storeName || 'Barreto Cell'}
                </span>
                <span className="text-[10px] text-cyan-400/90 font-medium tracking-wide hidden sm:block uppercase">
                  Assistência Técnica
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Quick Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenMobileGuide && (
              <button
                onClick={onOpenMobileGuide}
                title="Como usar no Celular / Instalar App"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 rounded-lg border border-emerald-800/80 transition-all whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Usar no Celular</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              title="Configurações da Loja"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onExportBackup}
              title="Baixar Backup dos Dados (JSON)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Backup</span>
            </button>

            <button
              onClick={onImportBackup}
              title="Restaurar Backup (JSON)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Restaurar</span>
            </button>

            <button
              onClick={onNewBudget}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-lg transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Orçamento / OS</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 no-scrollbar items-center">
          {onOpenMobileGuide && (
            <button
              onClick={onOpenMobileGuide}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap shrink-0 text-emerald-400 bg-emerald-950/80 border border-emerald-700 active:scale-95"
            >
              <Smartphone className="w-3 h-3 stroke-[2.5]" />
              <span>Instalar no Celular</span>
            </button>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
