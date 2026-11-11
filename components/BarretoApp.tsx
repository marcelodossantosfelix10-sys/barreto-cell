'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import FinancialOverview from './FinancialOverview';
import BudgetsAndOSTable from './BudgetsAndOSTable';
import BudgetOSModal from './BudgetOSModal';
import ExpensesManager from './ExpensesManager';
import StockManager from './StockManager';
import ProfitPricingCalculator from './ProfitPricingCalculator';
import PDFPreviewModal from './PDFPreviewModal';
import StoreSettingsModal from './StoreSettingsModal';
import MobileInstallGuideModal from './MobileInstallGuideModal';
import { BudgetOS, Expense, OSStatus, StockPart, StoreSettings } from '../lib/types';
import { 
  loadBudgets, 
  saveBudgets, 
  loadExpenses, 
  saveExpenses, 
  loadStock, 
  saveStock, 
  loadStoreSettings, 
  saveStoreSettings, 
  getNextOSCode,
  exportBackupJSON,
  importBackupJSON
} from '../lib/storage';

const triggerConfetti = async (opts?: any) => {
  if (typeof window === 'undefined') return;
  try {
    const confetti = (await import('canvas-confetti')).default;
    confetti(opts);
  } catch {
    // ignore
  }
};

export default function BarretoApp() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Lazy Initializers without setState cascading in effect
  const [budgets, setBudgets] = useState<BudgetOS[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadBudgets();
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadExpenses();
  });

  const [stock, setStock] = useState<StockPart[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadStock();
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    return loadStoreSettings();
  });

  // Modal States
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetOS | null>(null);
  const [previewBudget, setPreviewBudget] = useState<BudgetOS | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save changes
  const handleSaveBudget = (newBudget: BudgetOS) => {
    let updated: BudgetOS[];
    const exists = budgets.some((b) => b.id === newBudget.id);
    if (exists) {
      updated = budgets.map((b) => (b.id === newBudget.id ? newBudget : b));
      showToast(`Ordem de Serviço #${newBudget.code} atualizada com sucesso!`);
    } else {
      updated = [newBudget, ...budgets];
      showToast(`Orçamento #${newBudget.code} criado com sucesso!`);
      triggerConfetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    setBudgets(updated);
    saveBudgets(updated);
  };

  const handleUpdateStatus = (id: string, newStatus: OSStatus) => {
    const updated = budgets.map((b) => {
      if (b.id === id) {
        const isFinishing = newStatus === 'entregue' && b.status !== 'entregue';
        if (isFinishing) {
          triggerConfetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 },
          });
        }
        return {
          ...b,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          finishedAt: newStatus === 'entregue' ? new Date().toISOString() : b.finishedAt,
        };
      }
      return b;
    });
    setBudgets(updated);
    saveBudgets(updated);
    showToast(`Status atualizado com sucesso!`);
  };

  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    saveBudgets(updated);
    showToast('Registro excluído com sucesso.');
  };

  // Expenses handlers
  const handleAddExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    showToast(`Despesa "${expense.description}" registrada!`);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
    showToast('Despesa removida.');
  };

  // Stock handlers
  const handleAddStock = (part: StockPart) => {
    const updated = [part, ...stock];
    setStock(updated);
    saveStock(updated);
    showToast(`Peça "${part.name}" adicionada ao estoque.`);
  };

  const handleUpdateStock = (part: StockPart) => {
    const updated = stock.map((s) => (s.id === part.id ? part : s));
    setStock(updated);
    saveStock(updated);
    showToast(`Estoque de "${part.name}" atualizado.`);
  };

  const handleDeleteStock = (id: string) => {
    const updated = stock.filter((s) => s.id !== id);
    setStock(updated);
    saveStock(updated);
    showToast('Peça removida do estoque.');
  };

  // Settings
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoreSettings(newSettings);
    showToast('Configurações da Barreto Cell atualizadas!');
  };

  // Backup Import
  const handleImportFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && importBackupJSON(text)) {
          setBudgets(loadBudgets());
          setExpenses(loadExpenses());
          setStock(loadStock());
          setSettings(loadStoreSettings());
          showToast('Backup importado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        Iniciando Barreto Cell...
      </div>
    );
  }

  const nextCode = getNextOSCode(budgets);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewBudget={() => {
          setEditingBudget(null);
          setIsBudgetModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMobileGuide={() => setIsMobileGuideOpen(true)}
        onExportBackup={exportBackupJSON}
        onImportBackup={handleImportFile}
        settings={settings}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <FinancialOverview
            budgets={budgets}
            expenses={expenses}
            stock={stock}
            settings={settings}
            onNewBudget={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
            onNewExpense={() => setActiveTab('expenses')}
            onSelectBudget={(b) => setPreviewBudget(b)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsAndOSTable
            budgets={budgets}
            settings={settings}
            onNewBudget={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudget={(b) => {
              setEditingBudget(b);
              setIsBudgetModalOpen(true);
            }}
            onViewBudget={(b) => setPreviewBudget(b)}
            onDeleteBudget={handleDeleteBudget}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesManager
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'stock' && (
          <StockManager
            stock={stock}
            onAddStock={handleAddStock}
            onUpdateStock={handleUpdateStock}
            onDeleteStock={handleDeleteStock}
          />
        )}

        {activeTab === 'calculator' && <ProfitPricingCalculator />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-400">{settings.storeName}</strong> · Assistência Técnica Especializada
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap justify-center">
            <button
              onClick={() => setIsMobileGuideOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>📱 Usar no Celular</span>
            </button>
            <span>·</span>
            <span>WhatsApp: {settings.phone}</span>
            <span>·</span>
            <span>Chave PIX ({settings.pixKeyType}): {settings.pixKey}</span>
            <span>·</span>
            <button
              onClick={handleImportFile}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Restaurar Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Modal 1: Create / Edit Budget and Service Order (Remounts on key change) */}
      <BudgetOSModal
        key={isBudgetModalOpen ? (editingBudget ? editingBudget.id : 'new-' + budgets.length) : 'closed'}
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        initialBudget={editingBudget}
        stock={stock}
        settings={settings}
        nextCode={nextCode}
      />

      {/* Modal 2: Preview Official Budget & PDF / Print View */}
      <PDFPreviewModal
        budget={previewBudget}
        settings={settings}
        onClose={() => setPreviewBudget(null)}
      />

      {/* Modal 3: Store Settings */}
      <StoreSettingsModal
        key={isSettingsOpen ? 'settings-' + (settings.logoUrl || 'default') : 'settings-closed'}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Modal 4: Mobile Install & QR Code Guide */}
      <MobileInstallGuideModal
        isOpen={isMobileGuideOpen}
        onClose={() => setIsMobileGuideOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-cyan-500/50 shadow-2xl rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
