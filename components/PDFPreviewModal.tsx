'use client';

import React from 'react';
import { 
  X, 
  FileDown, 
  Printer, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Smartphone
} from 'lucide-react';
import { BudgetOS, StoreSettings } from '../lib/types';
import { formatCurrency, formatDate, generateBudgetPDF } from '../lib/pdfGenerator';
import { createWhatsAppBudgetUrl } from '../lib/whatsapp';

interface PDFPreviewModalProps {
  budget: BudgetOS | null;
  settings: StoreSettings;
  onClose: () => void;
}

export default function PDFPreviewModal({
  budget,
  settings,
  onClose,
}: PDFPreviewModalProps) {
  if (!budget) return null;

  const handleDownload = () => {
    generateBudgetPDF(budget, settings);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const { url } = createWhatsAppBudgetUrl(budget, settings, 'orcamento');
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Modal Top Actions Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Visualização de Orçamento / OS
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
              {budget.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container (Styled like real A4 invoice) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-950/40 flex-1">
          <div
            id="budget-printable-document"
            className="w-full bg-white text-slate-900 rounded-xl shadow-lg p-6 sm:p-8 space-y-6 font-sans text-xs border border-slate-200"
          >
            {/* Header Document */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-300 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.logoUrl || '/images/barreto_cell_logo.jpg'}
                      alt={settings.storeName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-950 tracking-tight">
                      {settings.storeName.toUpperCase()}
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-700">{settings.tagline}</p>
                    <p className="text-[10px] text-slate-500">
                      {settings.address} - {settings.cityState} · WhatsApp: {settings.phone} · CNPJ: {settings.cnpjCpf}
                    </p>
                  </div>
                </div>

              <div className="text-left sm:text-right bg-slate-100 p-3 rounded-lg border border-slate-200 min-w-44">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {budget.type === 'orcamento' ? 'ORÇAMENTO TÉCNICO' : 'ORDEM DE SERVIÇO'}
                </div>
                <div className="text-lg font-black font-mono text-cyan-700">{budget.code}</div>
                <div className="text-[10px] text-slate-500">Emissão: {formatDate(budget.createdAt)}</div>
                {budget.deliveryDate && (
                  <div className="text-[10px] text-slate-600 font-semibold">
                    Previsão: {formatDate(budget.deliveryDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Client & Device Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-1.5 bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Dados do Cliente
                </div>
                <div>
                  <strong className="text-slate-900">{budget.client.name}</strong>
                </div>
                <div className="text-slate-600">WhatsApp: {budget.client.phone}</div>
                {budget.client.document && (
                  <div className="text-slate-600">CPF: {budget.client.document}</div>
                )}
                {budget.client.email && (
                  <div className="text-slate-600">E-mail: {budget.client.email}</div>
                )}
              </div>

              {/* Aparelho */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-1.5 bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Dados do Aparelho
                </div>
                <div>
                  <strong className="text-slate-900">
                    {budget.device.brand} {budget.device.model}
                  </strong>
                </div>
                <div className="text-slate-600">
                  Cor: {budget.device.color || 'Não informada'} · IMEI: {budget.device.imeiOrSerial || '—'}
                </div>
                {budget.device.conditionNotes && (
                  <div className="text-slate-500 text-[11px]">
                    Estado de entrada: {budget.device.conditionNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Defeito e Laudo */}
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-1.5 bg-slate-50/30">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Defeito Relatado / Queixa do Cliente
              </div>
              <p className="text-slate-800 font-medium">{budget.problemDescription}</p>
              {budget.technicalReport && (
                <div className="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Laudo Técnico: </span>
                  {budget.technicalReport}
                </div>
              )}
            </div>

            {/* Checklist de Entrada Resumo */}
            <div className="border border-slate-200 rounded-lg p-3 text-[11px] bg-slate-50/20">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Checklist de Entrada na Bancada
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                <div>
                  Tela Quebrada:{' '}
                  <strong>{budget.checklist.screenBroken ? 'Sim' : 'Não'}</strong>
                </div>
                <div>
                  Touch:{' '}
                  <strong>{budget.checklist.touchOk ? 'Funciona' : 'Com falha'}</strong>
                </div>
                <div>
                  Câmeras:{' '}
                  <strong>{budget.checklist.camerasOk ? 'OK' : 'Falha'}</strong>
                </div>
                <div>
                  Carregamento:{' '}
                  <strong>{budget.checklist.chargingOk ? 'OK' : 'Falha'}</strong>
                </div>
              </div>
            </div>

            {/* Table of Services & Parts */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-2.5 px-3">Item / Serviço / Peça</th>
                    <th className="py-2.5 px-3 text-center w-16">Qtd</th>
                    <th className="py-2.5 px-3 text-right w-28">Valor Unit.</th>
                    <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {budget.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2.5 px-3 text-slate-800">{it.description}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                        {it.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                        {formatCurrency(it.sellPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(it.sellPrice * it.quantity)}
                      </td>
                    </tr>
                  ))}
                  {budget.laborPrice > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 text-slate-800">
                        Mão de Obra Técnica Especializada / Testes de Bancada
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 font-mono">1</td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                        {formatCurrency(budget.laborPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(budget.laborPrice)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals & Payment Strip */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Chave PIX Oficial ({settings.pixKeyType}):</span>
                </div>
                <div className="font-mono text-sm font-bold text-cyan-800 bg-cyan-50 px-2 py-1 rounded border border-cyan-200 inline-block">
                  {settings.pixKey}
                </div>
                <div className="text-[10px] text-slate-500">
                  Favorecido: {settings.tradeName}
                </div>
              </div>

              <div className="text-right space-y-1 bg-slate-900 text-white p-3.5 rounded-xl min-w-56">
                {budget.discount > 0 && (
                  <div className="flex justify-between text-xs text-rose-300">
                    <span>Desconto:</span>
                    <span className="font-mono">- {formatCurrency(budget.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold pt-1 border-t border-slate-700">
                  <span className="text-slate-300">VALOR TOTAL:</span>
                  <span className="text-xl font-mono text-cyan-300">
                    {formatCurrency(budget.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Warranty & Conditions Terms */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-1">
              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Termo de Garantia ({budget.warrantyDays || 90} dias) - Barreto Cell
              </div>
              <p className="text-[9.5px] text-slate-600 leading-relaxed whitespace-pre-line">
                {settings.customTerms}
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
              <div className="text-center space-y-1">
                <div className="border-b border-slate-400 w-4/5 mx-auto h-8" />
                <div className="text-[11px] font-semibold text-slate-800">
                  {budget.client.name}
                </div>
                <div className="text-[10px] text-slate-500">Assinatura do Cliente</div>
              </div>

              <div className="text-center space-y-1">
                <div className="border-b border-slate-400 w-4/5 mx-auto h-8" />
                <div className="text-[11px] font-semibold text-slate-800">
                  {settings.storeName}
                </div>
                <div className="text-[10px] text-slate-500">Visto do Técnico Responsável</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
