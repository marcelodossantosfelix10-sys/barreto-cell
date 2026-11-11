'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileDown, 
  MessageCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Phone, 
  Smartphone,
  ChevronDown,
  Filter
} from 'lucide-react';
import { BudgetOS, OSStatus, StoreSettings } from '../lib/types';
import { formatCurrency, formatDate, generateBudgetPDF } from '../lib/pdfGenerator';
import { createWhatsAppBudgetUrl } from '../lib/whatsapp';

interface BudgetsAndOSTableProps {
  budgets: BudgetOS[];
  settings: StoreSettings;
  onNewBudget: () => void;
  onEditBudget: (b: BudgetOS) => void;
  onViewBudget: (b: BudgetOS) => void;
  onDeleteBudget: (id: string) => void;
  onUpdateStatus: (id: string, status: OSStatus) => void;
}

export default function BudgetsAndOSTable({
  budgets,
  settings,
  onNewBudget,
  onEditBudget,
  onViewBudget,
  onDeleteBudget,
  onUpdateStatus,
}: BudgetsAndOSTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'orcamentos' | 'bancada' | 'prontos' | 'entregues'>('all');

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      // Search match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        b.code.toLowerCase().includes(query) ||
        b.client.name.toLowerCase().includes(query) ||
        b.client.phone.includes(query) ||
        b.device.model.toLowerCase().includes(query) ||
        b.device.brand.toLowerCase().includes(query) ||
        b.problemDescription.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Status match
      if (statusFilter === 'orcamentos') {
        return b.status === 'orcamento_pendente';
      }
      if (statusFilter === 'bancada') {
        return b.status === 'em_reparo' || b.status === 'aguardando_peca' || b.status === 'aprovado';
      }
      if (statusFilter === 'prontos') {
        return b.status === 'pronto';
      }
      if (statusFilter === 'entregues') {
        return b.status === 'entregue';
      }
      return true;
    });
  }, [budgets, searchTerm, statusFilter]);

  const handleDownloadPDF = (b: BudgetOS) => {
    generateBudgetPDF(b, settings);
  };

  const handleOpenWhatsApp = (b: BudgetOS) => {
    const messageType = b.status === 'pronto' ? 'pronto' : 'orcamento';
    const { url } = createWhatsAppBudgetUrl(b, settings, messageType);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Orçamentos & Ordens de Serviço
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Gerencie orçamentos em aberto, aparelhos na bancada e emissão de comprovantes com garantia.
          </p>
        </div>

        <button
          onClick={onNewBudget}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Criar Orçamento / OS</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por cliente, WhatsApp, modelo (ex: iPhone 11) ou código (ex: BC-1040)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'all', label: 'Todas as OSs', count: budgets.length },
              {
                id: 'orcamentos',
                label: 'Orçamentos',
                count: budgets.filter((b) => b.status === 'orcamento_pendente').length,
              },
              {
                id: 'bancada',
                label: 'Na Bancada',
                count: budgets.filter(
                  (b) =>
                    b.status === 'em_reparo' ||
                    b.status === 'aguardando_peca' ||
                    b.status === 'aprovado'
                ).length,
              },
              {
                id: 'prontos',
                label: 'Prontos',
                count: budgets.filter((b) => b.status === 'pronto').length,
              },
              {
                id: 'entregues',
                label: 'Entregues',
                count: budgets.filter((b) => b.status === 'entregue').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400 font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredBudgets.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Smartphone className="w-12 h-12 text-slate-600 mx-auto stroke-[1.5]" />
            <h3 className="text-base font-medium text-slate-300">Nenhum registro encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nenhum orçamento ou ordem de serviço coincide com os filtros aplicados.
            </p>
            <button
              onClick={onNewBudget}
              className="mt-2 px-4 py-2 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
            >
              Criar Novo Orçamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-4">Código / Tipo</th>
                  <th className="py-3 px-4">Cliente & Contato</th>
                  <th className="py-3 px-4">Aparelho & Defeito</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-right">Lucro Limpo</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBudgets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Código / Tipo */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-cyan-400 text-sm">{b.code}</div>
                      <div className="text-[11px] text-slate-500">
                        {b.type === 'orcamento' ? 'Orçamento' : 'Ordem de Serviço'} · {formatDate(b.createdAt)}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{b.client.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{b.client.phone}</span>
                      </div>
                    </td>

                    {/* Aparelho */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200 whitespace-nowrap">
                        {b.device.brand} {b.device.model}
                        {b.device.color ? ` (${b.device.color})` : ''}
                      </div>
                      <div
                        className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5"
                        title={b.problemDescription}
                      >
                        {b.problemDescription}
                      </div>
                    </td>

                    {/* Valor Total */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-white text-sm">
                        {formatCurrency(b.totalAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {b.paymentStatus === 'pago' ? (
                          <span className="text-emerald-400">Pago ({b.paymentMethod.toUpperCase()})</span>
                        ) : (
                          <span className="text-amber-400">Pendente</span>
                        )}
                      </div>
                    </td>

                    {/* Lucro */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="font-mono font-bold text-emerald-400">
                        {formatCurrency(b.grossProfit)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Peças: {formatCurrency(b.totalPartsCost)}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <select
                        value={b.status}
                        onChange={(e) => onUpdateStatus(b.id, e.target.value as OSStatus)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium border cursor-pointer focus:outline-none transition-colors ${
                          b.status === 'entregue'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : b.status === 'pronto'
                            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                            : b.status === 'em_reparo'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : b.status === 'aguardando_peca'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                            : b.status === 'orcamento_pendente'
                            ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="orcamento_pendente">Aguard. Aprovação</option>
                        <option value="aprovado">Aprovado pelo Cliente</option>
                        <option value="em_reparo">Na Bancada (Reparo)</option>
                        <option value="aguardando_peca">Aguardando Peça</option>
                        <option value="pronto">Pronto p/ Retirada</option>
                        <option value="entregue">Entregue & Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => handleOpenWhatsApp(b)}
                          title="Enviar Orçamento via WhatsApp para o Cliente"
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Download PDF Button */}
                        <button
                          onClick={() => handleDownloadPDF(b)}
                          title="Baixar PDF Oficial para Impressão"
                          className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        {/* View Preview Button */}
                        <button
                          onClick={() => onViewBudget(b)}
                          title="Visualizar Detalhes & Orçamento na Tela"
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditBudget(b)}
                          title="Editar Orçamento ou Peças"
                          className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir a OS #${b.code}?`)) {
                              onDeleteBudget(b.id);
                            }
                          }}
                          title="Excluir OS"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
