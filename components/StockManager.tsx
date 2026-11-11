'use client';

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Search, 
  DollarSign, 
  Layers,
  CheckCircle2
} from 'lucide-react';
import { StockPart } from '../lib/types';
import { formatCurrency } from '../lib/pdfGenerator';

interface StockManagerProps {
  stock: StockPart[];
  onAddStock: (part: StockPart) => void;
  onUpdateStock: (part: StockPart) => void;
  onDeleteStock: (id: string) => void;
}

export default function StockManager({
  stock,
  onAddStock,
  onUpdateStock,
  onDeleteStock,
}: StockManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<StockPart | null>(null);

  // Form
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [compatibleModels, setCompatibleModels] = useState('');
  const [category, setCategory] = useState<any>('tela');
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(2);
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');

  const filteredStock = useMemo(() => {
    return stock.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.compatibleModels.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [stock, searchTerm, categoryFilter]);

  const totalCapitalInvested = useMemo(() => {
    return stock.reduce((acc, curr) => acc + curr.costPrice * curr.quantity, 0);
  }, [stock]);

  const totalPotentialReturn = useMemo(() => {
    return stock.reduce((acc, curr) => acc + curr.sellPrice * curr.quantity, 0);
  }, [stock]);

  const openNewModal = () => {
    setEditingPart(null);
    setName('');
    setBrand('Apple');
    setCompatibleModels('');
    setCategory('tela');
    setQuantity(2);
    setMinQuantity(2);
    setCostPrice('');
    setSellPrice('');
    setSupplier('');
    setIsModalOpen(true);
  };

  const openEditModal = (part: StockPart) => {
    setEditingPart(part);
    setName(part.name);
    setBrand(part.brand);
    setCompatibleModels(part.compatibleModels);
    setCategory(part.category);
    setQuantity(part.quantity);
    setMinQuantity(part.minQuantity);
    setCostPrice(part.costPrice);
    setSellPrice(part.sellPrice);
    setSupplier(part.supplier || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const partData: StockPart = {
      id: editingPart ? editingPart.id : 'st-' + Date.now(),
      name: name.trim(),
      brand,
      compatibleModels: compatibleModels.trim(),
      category,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 1,
      costPrice: Number(costPrice) || 0,
      sellPrice: Number(sellPrice) || 0,
      supplier: supplier.trim() || undefined,
    };

    if (editingPart) {
      onUpdateStock(partData);
    } else {
      onAddStock(partData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Estoque de Peças & Componentes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Controle de displays, baterias e conectores disponíveis para reposição na bancada da Barreto Cell.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Nova Peça</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Capital Investido em Estoque</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
            {formatCurrency(totalCapitalInvested)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Custo real parado na prateleira</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Potencial Bruto de Venda</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {formatCurrency(totalPotentialReturn)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Lucro projetado:{' '}
            <strong className="text-cyan-300 font-mono">
              {formatCurrency(totalPotentialReturn - totalCapitalInvested)}
            </strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Itens em Alerta (Estoque Baixo)</div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums mt-1">
            {stock.filter((s) => s.quantity <= s.minQuantity).length} itens
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Necessitam reposição urgente</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por peça, modelo compatível (ex: iPhone 11, Galaxy A54)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">Todas as Peças</option>
              <option value="tela">Telas / Displays</option>
              <option value="bateria">Baterias</option>
              <option value="conector">Conectores de Carga</option>
              <option value="camera">Câmeras</option>
              <option value="tampa">Tampas Traseiras</option>
              <option value="outro">Outros / Acessórios</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredStock.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Nenhuma peça encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-4">Peça / Componente</th>
                  <th className="py-3 px-4">Compatibilidade</th>
                  <th className="py-3 px-4 text-center">Quantidade</th>
                  <th className="py-3 px-4 text-right">Custo Loja</th>
                  <th className="py-3 px-4 text-right">Preço de Venda</th>
                  <th className="py-3 px-4 text-right">Margem Bruta</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStock.map((s) => {
                  const isLow = s.quantity <= s.minQuantity;
                  const markup =
                    s.sellPrice > 0 ? ((s.sellPrice - s.costPrice) / s.sellPrice) * 100 : 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">
                        <div>{s.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {s.brand} · Fornecedor: {s.supplier || 'Geral'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {s.compatibleModels || '—'}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                            isLow
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          <span>{s.quantity} un</span>
                        </span>
                        {isLow && (
                          <div className="text-[9px] text-rose-400 mt-0.5">Estoque Baixo!</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-400 whitespace-nowrap">
                        {formatCurrency(s.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrency(s.sellPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-cyan-300 whitespace-nowrap">
                        {markup.toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir peça "${s.name}"?`)) {
                                onDeleteStock(s.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Part */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-base font-bold text-white">
                {editingPart ? 'Editar Peça do Estoque' : 'Cadastrar Nova Peça'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Nome da Peça / Componente *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tela Frontal iPhone 13 OLED Incell"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Marca</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Universal">Universal / Outros</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="tela">Tela / Display</option>
                    <option value="bateria">Bateria</option>
                    <option value="conector">Conector de Carga</option>
                    <option value="camera">Câmera</option>
                    <option value="tampa">Tampa Traseira</option>
                    <option value="outro">Outro Insumo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Modelos Compatíveis
                </label>
                <input
                  type="text"
                  placeholder="Ex: iPhone 13 / 13 Pro (A2482, A2638)"
                  value={compatibleModels}
                  onChange={(e) => setCompatibleModels(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Quantidade Atual
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Preço de Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Preço de Venda Sugerido (R$)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Nome do Fornecedor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Distribuidora TechParts SP"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
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
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg transition-colors shadow cursor-pointer"
                >
                  Salvar Peça
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
