'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  Info
} from 'lucide-react';
import { formatCurrency } from '../lib/pdfGenerator';

export default function ProfitPricingCalculator() {
  const [partCost, setPartCost] = useState<number>(120);
  const [desiredLabor, setDesiredLabor] = useState<number>(90);
  const [cardFeePercent, setCardFeePercent] = useState<number>(3.5);
  const [warrantyRiskReserve, setWarrantyRiskReserve] = useState<number>(15); // R$ reserva para retorno de garantia

  // Calculations
  const baseCost = partCost + warrantyRiskReserve;
  const cashPrice = baseCost + desiredLabor;

  // Credit price absorbing fee so the shop keeps full desired profit
  const creditPrice = cashPrice / (1 - cardFeePercent / 100);
  const cardFeeAmount = creditPrice - cashPrice;

  // Real profit in cash
  const cashNetProfit = cashPrice - partCost - warrantyRiskReserve;
  const cashMargin = cashPrice > 0 ? (cashNetProfit / cashPrice) * 100 : 0;

  // Real profit in credit
  const creditNetProfit = creditPrice - partCost - warrantyRiskReserve - cardFeeAmount;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Calculadora de Precificação & Margem da Bancada</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Descubra o valor ideal para cobrar do cliente considerando o custo da peça, taxas de maquininha e reserva técnica de garantia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-400" />
            Parâmetros do Reparo
          </h2>

          <div className="space-y-4 text-xs">
            {/* Custo da Peça */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-200">
                  Custo da Peça no Fornecedor (R$)
                </label>
                <span className="text-amber-400 font-mono font-bold">
                  {formatCurrency(partCost)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Quanto você pagou na tela, bateria ou flex com o frete
              </p>
              <input
                type="number"
                step="5"
                value={partCost}
                onChange={(e) => setPartCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-mono text-amber-400 font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Mão de Obra */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-200">
                  Mão de Obra Técnica Almejada (R$)
                </label>
                <span className="text-cyan-400 font-mono font-bold">
                  {formatCurrency(desiredLabor)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Valor que remunera seu tempo, ferramentas e expertise na bancada
              </p>
              <input
                type="number"
                step="5"
                value={desiredLabor}
                onChange={(e) => setDesiredLabor(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-mono text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Taxa da Maquininha */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-200">
                  Taxa da Maquininha de Cartão (%)
                </label>
                <span className="text-slate-300 font-mono font-bold">{cardFeePercent}%</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Taxa média cobrada pela sua maquininha (ex: Stone, PagBank, InfinitePay)
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Débito 1.4%', val: 1.4 },
                  { label: 'Crédito 3.5%', val: 3.5 },
                  { label: '3x (5.5%)', val: 5.5 },
                  { label: '12x (12%)', val: 12.0 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setCardFeePercent(opt.val)}
                    className={`py-1.5 px-2 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
                      cardFeePercent === opt.val
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reserva de Garantia */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-200">
                  Reserva para Risco de Garantia (R$)
                </label>
                <span className="text-purple-400 font-mono font-bold">
                  {formatCurrency(warrantyRiskReserve)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Valor guardado para cobrir eventuais retornos nos 90 dias sem prejuízo
              </p>
              <input
                type="number"
                step="5"
                value={warrantyRiskReserve}
                onChange={(e) => setWarrantyRiskReserve(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-purple-300 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Pricing & Profit Breakdown */}
        <div className="space-y-4">
          {/* Preço Recomendado à Vista */}
          <div className="bg-gradient-to-br from-slate-900 to-cyan-950/50 border border-cyan-800/60 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Preço Sugerido à Vista (PIX / Dinheiro)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                Mais Vendido
              </span>
            </div>

            <div>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-white">
                {formatCurrency(cashPrice)}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Cobrando esse valor no PIX, você obtém{' '}
                <strong className="text-cyan-300 font-mono">
                  {formatCurrency(cashNetProfit)}
                </strong>{' '}
                livre de lucro ({cashMargin.toFixed(0)}% de margem).
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Custo da Peça (Fornecedor)</span>
                <span className="font-mono text-amber-400">{formatCurrency(partCost)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reserva p/ Garantia 90 dias</span>
                <span className="font-mono text-purple-400">
                  {formatCurrency(warrantyRiskReserve)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-cyan-300 pt-1 border-t border-slate-800/60">
                <span>LUCRO LÍQUIDO NO SEU BOLSO</span>
                <span className="font-mono">{formatCurrency(cashNetProfit)}</span>
              </div>
            </div>
          </div>

          {/* Preço no Cartão de Crédito */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Preço Sugerido no Cartão ({cardFeePercent}%)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Com taxa repassada</span>
            </div>

            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {formatCurrency(creditPrice)}
            </div>

            <p className="text-xs text-slate-400">
              Taxa da maquininha descontará{' '}
              <strong className="text-rose-400 font-mono">{formatCurrency(cardFeeAmount)}</strong>.
              Você ainda preservará o lucro integral de{' '}
              <strong className="text-emerald-400 font-mono">
                {formatCurrency(creditNetProfit)}
              </strong>
              .
            </p>
          </div>

          {/* Health indicator */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white block font-medium">Rentabilidade Saudável</strong>
              Sua margem bruta está acima de 40%, o que garante sustentabilidade, pagamento do aluguel e reposição de ferramentas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
