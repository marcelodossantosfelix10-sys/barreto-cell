'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  DollarSign, 
  TrendingDown, 
  Tag, 
  CreditCard,
  Building,
  Zap,
  Package,
  Wrench,
  Megaphone,
  Receipt
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/pdfGenerator';

interface ExpensesManagerProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; icon: any }> = {
  aluguel: { label: 'Aluguel do Ponto', icon: Building },
  energia_agua_internet: { label: 'Energia / Água / Net', icon: Zap },
  pecas_estoque: { label: 'Compra de Lote de Peças', icon: Package },
  ferramentas_insumos: { label: 'Ferramentas & Insumos', icon: Wrench },
  marketing_divulgacao: { label: 'Marketing & Anúncios', icon: Megaphone },
  impostos_mei: { label: 'DAS MEI / Impostos', icon: Receipt },
  alimentacao: { label: 'Alimentação', icon: DollarSign },
  outros: { label: 'Outros Gastos', icon: Tag },
};

export default function ExpensesManager({
  expenses,
  onAddExpense,
  onDeleteExpense,
}: ExpensesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Expense Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('aluguel');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCat === 'all' || e.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [expenses, searchTerm, selectedCat]);

  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      alert('Preencha a descrição e um valor válido.');
      return;
    }

    const newExp: Expense = {
      id: 'exp-' + Date.now(),
      description: description.trim(),
      category,
      amount: Number(amount),
      date,
      paymentMethod,
      isRecurring,
      notes: notes.trim() || undefined,
    };

    onAddExpense(newExp);
    setIsModalOpen(false);
    // reset
    setDescription('');
    setAmount('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Gestão de Despesas & Custos Operacionais
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registre aluguel, contas de luz, compras de peças e insumos para apurar o lucro líquido com precisão.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-rose-400 hover:bg-rose-300 rounded-lg transition-all shadow-md shadow-rose-500/20 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Nova Despesa</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total de Despesas Cadastradas</div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums mt-1">
            {formatCurrency(totalExpenseAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {expenses.length} lançamentos registrados
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Despesas Fixas Recorrentes</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            {formatCurrency(
              expenses.filter((e) => e.isRecurring).reduce((acc, c) => acc + c.amount, 0)
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Aluguel, internet, contas mensais</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Gastos com Insumos & Peças</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
            {formatCurrency(
              expenses
                .filter((e) => e.category === 'pecas_estoque' || e.category === 'ferramentas_insumos')
                .reduce((acc, c) => acc + c.amount, 0)
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Lotes de telas, cola, chaves</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por descrição de despesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
            >
              <option value="all">Todas as Categorias</option>
              {Object.entries(CATEGORY_MAP).map(([cat, info]) => (
                <option key={cat} value={cat}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Nenhuma despesa localizada com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.map((e) => {
                  const catInfo = CATEGORY_MAP[e.category] || CATEGORY_MAP.outros;
                  const Icon = catInfo.icon;
                  return (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono">
                        {formatDate(e.date)}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{e.description}</span>
                          {e.isRecurring && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                              Recorrente
                            </span>
                          )}
                        </div>
                        {e.notes && <div className="text-[11px] text-slate-500 mt-0.5">{e.notes}</div>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          <Icon className="w-3 h-3 text-slate-400" />
                          <span>{catInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap uppercase text-[11px] text-slate-400 font-mono">
                        {e.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-rose-400 text-sm">
                        - {formatCurrency(e.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (confirm(`Excluir despesa "${e.description}"?`)) {
                              onDeleteExpense(e.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-base font-bold text-white">Cadastrar Despesa da Loja</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Descrição do Gasto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aluguel da Loja, Compra de 5 Telas iPhone 11"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.00"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono font-bold focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-rose-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_MAP).map(([cat, info]) => (
                      <option key={cat} value={cat}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Forma de Pagto</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-rose-500 focus:outline-none"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão Crédito</option>
                    <option value="cartao_debito">Cartão Débito</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-700 text-rose-500"
                />
                <span className="text-slate-300">Despesa fixa recorrente (todo mês)</span>
              </label>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Observações (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Fornecedor TechParts, NF nº 4892"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-lg transition-colors shadow cursor-pointer"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
