'use client';

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { BudgetOS, Expense, StockPart, StoreSettings } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/pdfGenerator';

interface FinancialOverviewProps {
  budgets: BudgetOS[];
  expenses: Expense[];
  stock: StockPart[];
  settings: StoreSettings;
  onNewBudget: () => void;
  onNewExpense: () => void;
  onSelectBudget: (b: BudgetOS) => void;
  onNavigateTab: (tab: string) => void;
}

export default function FinancialOverview({
  budgets,
  expenses,
  stock,
  settings,
  onNewBudget,
  onNewExpense,
  onSelectBudget,
  onNavigateTab,
}: FinancialOverviewProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filter by date
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - 7 * 86400000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const isWithin = (dateStr?: string) => {
      if (!dateStr) return false;
      const t = new Date(dateStr).getTime();
      if (period === 'today') return t >= startOfToday;
      if (period === 'week') return t >= startOfWeek;
      if (period === 'month') return t >= startOfMonth;
      return true; // 'all'
    };

    // Relevant budgets
    const bList = budgets.filter((b) => isWithin(b.createdAt) || isWithin(b.finishedAt));
    const eList = expenses.filter((e) => isWithin(e.date));

    // Revenue from finalized / paid orders or currently active approved
    let totalRevenue = 0;
    let totalPartsCost = 0;
    let pendingPotentialRevenue = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let waitingApprovalCount = 0;

    bList.forEach((b) => {
      if (b.status === 'entregue' || b.paymentStatus === 'pago') {
        totalRevenue += b.totalAmount;
        totalPartsCost += b.totalPartsCost;
        completedCount++;
      } else if (b.status === 'cancelado') {
        // do not sum
      } else if (b.status === 'orcamento_pendente') {
        waitingApprovalCount++;
        pendingPotentialRevenue += b.totalAmount;
      } else {
        // em_reparo, aguardando_peca, pronto
        inProgressCount++;
        pendingPotentialRevenue += b.totalAmount;
        // if partially paid
        if (b.paidAmount) {
          totalRevenue += b.paidAmount;
        }
      }
    });

    const totalExpenses = eList.reduce((acc, curr) => acc + curr.amount, 0);
    const grossProfit = totalRevenue - totalPartsCost;
    const netProfit = grossProfit - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Expenses by category
    const categoryTotals: Record<string, number> = {};
    eList.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    return {
      totalRevenue,
      totalPartsCost,
      totalExpenses,
      grossProfit,
      netProfit,
      margin,
      pendingPotentialRevenue,
      completedCount,
      inProgressCount,
      waitingApprovalCount,
      categoryTotals,
      bList,
      eList,
    };
  }, [budgets, expenses, period]);

  // Stock low alerts
  const lowStockItems = useMemo(() => {
    return stock.filter((s) => s.quantity <= s.minQuantity);
  }, [stock]);

  const categoryLabels: Record<string, string> = {
    aluguel: 'Aluguel do Ponto',
    energia_agua_internet: 'Energia / Água / Net',
    pecas_estoque: 'Reposição de Peças',
    ferramentas_insumos: 'Ferramentas & Insumos',
    marketing_divulgacao: 'Marketing & Anúncios',
    impostos_mei: 'DAS MEI / Impostos',
    alimentacao: 'Alimentação',
    outros: 'Outros Custos',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Controle Financeiro da {settings.storeName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Demonstrativo de faturamento bruto, custo de peças, despesas e lucro líquido real na bancada.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0 self-start sm:self-auto">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: '7 Dias' },
            { id: 'month', label: 'Este Mês' },
            { id: 'all', label: 'Tudo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                period === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Grid - 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento Bruto */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Faturamento Bruto</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono tabular-nums tracking-tight">
              {formatCurrency(filteredData.totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                {filteredData.completedCount} OSs pagas
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Custo de Peças */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Custo de Peças (Telas/Baterias)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-200 font-mono tabular-nums tracking-tight">
              {formatCurrency(filteredData.totalPartsCost)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span>Peças gastas nos serviços finalizados</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Despesas Operacionais */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Despesas da Loja</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums tracking-tight">
              {formatCurrency(filteredData.totalExpenses)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span>Aluguel, contas e insumos</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Lucro Líquido Real */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/40 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">Lucro Líquido Limpo</span>
            <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-extrabold font-mono tabular-nums tracking-tight ${
                filteredData.netProfit >= 0 ? 'text-cyan-300' : 'text-rose-400'
              }`}
            >
              {formatCurrency(filteredData.netProfit)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-300">
              <span className="font-semibold text-cyan-400">
                {filteredData.margin.toFixed(1)}% de margem
              </span>
              <span>no período</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Strip: Potencial a Receber & Status da Bancada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Aparelhos na Bancada (Em Reparo)</div>
            <div className="text-lg font-bold text-amber-300 font-mono tabular-nums">
              {filteredData.inProgressCount} aparelhos
            </div>
            <div className="text-[11px] text-slate-500">Sendo consertados no momento</div>
          </div>
          <Clock className="w-8 h-8 text-amber-400/40" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Orçamentos Aguardando Cliente</div>
            <div className="text-lg font-bold text-sky-400 font-mono tabular-nums">
              {filteredData.waitingApprovalCount} propostas
            </div>
            <div className="text-[11px] text-slate-500">Enviadas pelo WhatsApp</div>
          </div>
          <FileText className="w-8 h-8 text-sky-400/40" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Potencial a Faturar (Em aberto)</div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              {formatCurrency(filteredData.pendingPotentialRevenue)}
            </div>
            <div className="text-[11px] text-slate-500">OSs e orçamentos ativos</div>
          </div>
          <DollarSign className="w-8 h-8 text-cyan-400/40" />
        </div>
      </div>

      {/* Financial Health Visualizer & Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Demonstrative (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Composição Financeira (Faturamento vs Custos)
            </h2>
            <span className="text-xs text-slate-400">
              Lucro Bruto: {formatCurrency(filteredData.grossProfit)}
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Distribuição do que entra na Barreto Cell</span>
              <span>100% da Receita</span>
            </div>

            <div className="h-6 w-full bg-slate-800 rounded-lg overflow-hidden flex shadow-inner">
              {filteredData.totalRevenue > 0 ? (
                <>
                  {/* Custo de peças */}
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (filteredData.totalPartsCost / filteredData.totalRevenue) * 100
                      )}%`,
                    }}
                    className="bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap px-1"
                    title={`Peças: ${formatCurrency(filteredData.totalPartsCost)}`}
                  >
                    {filteredData.totalPartsCost > 0 &&
                      `${(
                        (filteredData.totalPartsCost / filteredData.totalRevenue) *
                        100
                      ).toFixed(0)}% Peças`}
                  </div>

                  {/* Despesas */}
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (filteredData.totalExpenses / filteredData.totalRevenue) * 100
                      )}%`,
                    }}
                    className="bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center transition-all overflow-hidden whitespace-nowrap px-1"
                    title={`Despesas: ${formatCurrency(filteredData.totalExpenses)}`}
                  >
                    {filteredData.totalExpenses > 0 &&
                      `${(
                        (filteredData.totalExpenses / filteredData.totalRevenue) *
                        100
                      ).toFixed(0)}% Desp.`}
                  </div>

                  {/* Lucro Líquido */}
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        (filteredData.netProfit / filteredData.totalRevenue) * 100
                      )}%`,
                    }}
                    className="bg-cyan-400 text-[10px] font-bold text-slate-950 flex items-center justify-center transition-all overflow-hidden whitespace-nowrap px-1"
                    title={`Lucro Limpo: ${formatCurrency(filteredData.netProfit)}`}
                  >
                    {filteredData.netProfit > 0 &&
                      `${(
                        (filteredData.netProfit / filteredData.totalRevenue) *
                        100
                      ).toFixed(0)}% Lucro Líquido`}
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-center text-xs text-slate-500">
                  Nenhum faturamento registrado no período selecionado
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span className="text-slate-400">
                  Custo de Peças:{' '}
                  <strong className="text-white font-mono">
                    {formatCurrency(filteredData.totalPartsCost)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                <span className="text-slate-400">
                  Despesas da Loja:{' '}
                  <strong className="text-white font-mono">
                    {formatCurrency(filteredData.totalExpenses)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
                <span className="text-slate-400">
                  Lucro Líquido Real:{' '}
                  <strong className="text-cyan-300 font-mono">
                    {formatCurrency(filteredData.netProfit)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick DRE Statement (Demonstrativo do Resultado) */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Demonstrativo Simplificado (DRE da Bancada)
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">(+) Receita Bruta de Reparos e Peças</span>
                <span className="font-mono tabular-nums text-white">
                  {formatCurrency(filteredData.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-amber-400">(-) Custo Direto das Peças Aplicadas</span>
                <span className="font-mono tabular-nums text-amber-400">
                  - {formatCurrency(filteredData.totalPartsCost)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60 font-medium">
                <span className="text-slate-200">(=) Lucro Bruto da Assistência</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  {formatCurrency(filteredData.grossProfit)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-rose-400">(-) Despesas Operacionais (Aluguel, Luz, MEI)</span>
                <span className="font-mono tabular-nums text-rose-400">
                  - {formatCurrency(filteredData.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-bold bg-slate-800/40 px-2 rounded">
                <span className="text-cyan-400">(=) LUCRO LÍQUIDO FINAL NO BOLSO</span>
                <span className="font-mono tabular-nums text-cyan-300">
                  {formatCurrency(filteredData.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses by Category & Quick Alerts (1 col) */}
        <div className="space-y-6">
          {/* Despesas por Categoria */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Gastos por Categoria</h2>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Gerenciar
              </button>
            </div>

            <div className="space-y-3">
              {Object.keys(filteredData.categoryTotals).length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Nenhuma despesa no período.
                </p>
              ) : (
                Object.entries(filteredData.categoryTotals).map(([cat, amount]) => {
                  const percent =
                    filteredData.totalExpenses > 0
                      ? (amount / filteredData.totalExpenses) * 100
                      : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{categoryLabels[cat] || cat}</span>
                        <span className="font-mono text-slate-200">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-rose-500/80 rounded-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={onNewExpense}
              className="w-full mt-2 py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Registrar Nova Despesa</span>
            </button>
          </div>

          {/* Low Stock Alert Box */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Alerta de Reposição ({lowStockItems.length} peças baixas)</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-300">
                {lowStockItems.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-[11px]">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="text-amber-400 font-mono font-bold shrink-0">
                      Restam {item.quantity} un
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigateTab('stock')}
                className="w-full text-center text-xs text-amber-400 hover:text-amber-300 pt-1 font-medium cursor-pointer"
              >
                Abrir Estoque de Peças →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Work Orders & Quotes Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Ordens de Serviço & Orçamentos Recentes</h2>
            <p className="text-xs text-slate-400">Últimos atendimentos cadastrados na Barreto Cell</p>
          </div>
          <button
            onClick={() => onNavigateTab('budgets')}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
          >
            Ver todas as {budgets.length} OSs →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Aparelho</th>
                <th className="py-2.5 px-3">Defeito</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3 text-right">Lucro Estimado</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {budgets.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                    {b.code}
                  </td>
                  <td className="py-3 px-3 text-white font-medium whitespace-nowrap">
                    {b.client.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    {b.device.brand} {b.device.model}
                  </td>
                  <td className="py-3 px-3 text-slate-400 max-w-xs truncate" title={b.problemDescription}>
                    {b.problemDescription}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                    {formatCurrency(b.totalAmount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                    {formatCurrency(b.grossProfit)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        b.status === 'entregue'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'pronto'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                          : b.status === 'em_reparo'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : b.status === 'orcamento_pendente'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {b.status === 'entregue'
                        ? 'Entregue'
                        : b.status === 'pronto'
                        ? 'Pronto'
                        : b.status === 'em_reparo'
                        ? 'Na Bancada'
                        : b.status === 'orcamento_pendente'
                        ? 'Aguard. Aprovação'
                        : b.status === 'aguardando_peca'
                        ? 'Aguard. Peça'
                        : 'Cancelado'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectBudget(b)}
                      className="px-2.5 py-1 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
