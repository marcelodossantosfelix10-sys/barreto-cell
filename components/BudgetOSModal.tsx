'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  FileDown, 
  MessageCircle, 
  Save, 
  CheckCircle2, 
  Smartphone, 
  Wrench, 
  DollarSign, 
  Shield, 
  Calendar,
  AlertCircle,
  Package
} from 'lucide-react';
import { BudgetOS, BudgetOSItem, DeviceChecklist, OSStatus, OSType, PaymentMethod, PaymentStatus, StockPart, StoreSettings } from '../lib/types';
import { formatCurrency, generateBudgetPDF } from '../lib/pdfGenerator';
import { createWhatsAppBudgetUrl } from '../lib/whatsapp';

interface BudgetOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: BudgetOS) => void;
  initialBudget?: BudgetOS | null;
  stock: StockPart[];
  settings: StoreSettings;
  nextCode: string;
}

const DEFAULT_CHECKLIST: DeviceChecklist = {
  screenBroken: false,
  touchOk: true,
  camerasOk: true,
  wifiOk: true,
  micSpeakerOk: true,
  chargingOk: true,
  biometricsOk: true,
  housingScratches: false,
  waterDamage: false,
};

function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export default function BudgetOSModal({
  isOpen,
  onClose,
  onSave,
  initialBudget,
  stock,
  settings,
  nextCode,
}: BudgetOSModalProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'client_device' | 'parts_labor' | 'delivery_terms'>('client_device');
  
  // Initialize state directly from props without cascading useEffect
  const [type, setType] = useState<OSType>(() => initialBudget?.type || 'orcamento');
  const [status, setStatus] = useState<OSStatus>(() => initialBudget?.status || 'orcamento_pendente');
  const [code, setCode] = useState(() => initialBudget?.code || nextCode);

  // Client
  const [clientName, setClientName] = useState(() => initialBudget?.client.name || '');
  const [clientPhone, setClientPhone] = useState(() => initialBudget?.client.phone || '');
  const [clientDoc, setClientDoc] = useState(() => initialBudget?.client.document || '');
  const [clientEmail, setClientEmail] = useState(() => initialBudget?.client.email || '');

  // Device
  const [deviceBrand, setDeviceBrand] = useState(() => initialBudget?.device.brand || 'Apple');
  const [deviceModel, setDeviceModel] = useState(() => initialBudget?.device.model || '');
  const [deviceColor, setDeviceColor] = useState(() => initialBudget?.device.color || '');
  const [deviceImei, setDeviceImei] = useState(() => initialBudget?.device.imeiOrSerial || '');
  const [devicePasscode, setDevicePasscode] = useState(() => initialBudget?.device.passcodeOrPattern || '');
  const [deviceCondition, setDeviceCondition] = useState(() => initialBudget?.device.conditionNotes || '');
  const [checklist, setChecklist] = useState<DeviceChecklist>(() => initialBudget?.checklist || DEFAULT_CHECKLIST);

  // Defect & Report
  const [problemDescription, setProblemDescription] = useState(() => initialBudget?.problemDescription || '');
  const [technicalReport, setTechnicalReport] = useState(() => initialBudget?.technicalReport || '');

  // Items / Parts
  const [items, setItems] = useState<BudgetOSItem[]>(() => {
    if (initialBudget && initialBudget.items && initialBudget.items.length > 0) {
      return initialBudget.items;
    }
    return [
      {
        id: 'it-default',
        description: 'Peça de reposição ou tela',
        type: 'peca',
        costPrice: 80.0,
        sellPrice: 200.0,
        quantity: 1,
      },
    ];
  });
  const [laborPrice, setLaborPrice] = useState<number>(() => initialBudget?.laborPrice ?? 80.0);
  const [discount, setDiscount] = useState<number>(() => initialBudget?.discount ?? 0.0);

  // Terms & Delivery
  const [deliveryDate, setDeliveryDate] = useState(() => initialBudget?.deliveryDate || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => initialBudget?.paymentMethod || 'pix');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(() => initialBudget?.paymentStatus || 'pendente');
  const [warrantyDays, setWarrantyDays] = useState<number>(() => initialBudget?.warrantyDays || settings.defaultWarrantyDays || 90);
  const [internalNotes, setInternalNotes] = useState(() => initialBudget?.internalNotes || '');

  // AI Diagnostic Loading
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any | null>(null);

  // Quick Stock Picker
  const [selectedStockId, setSelectedStockId] = useState('');

  if (!isOpen) return null;

  // Real-time Financial Calculations
  const partsSellTotal = items.reduce((acc, it) => acc + (it.sellPrice || 0) * (it.quantity || 1), 0);
  const partsCostTotal = items.reduce((acc, it) => acc + (it.costPrice || 0) * (it.quantity || 1), 0);
  const totalAmount = Math.max(0, partsSellTotal + laborPrice - discount);
  const grossProfit = totalAmount - partsCostTotal;
  const marginPercent = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;

  // AI Diagnostic Trigger
  const handleRunAiDiagnosis = async () => {
    if (!problemDescription) {
      alert('Por favor, descreva o defeito relatado antes de solicitar a análise da IA.');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai-diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: deviceBrand,
          model: deviceModel,
          defect: problemDescription,
        }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }
      setAiSuggestions(data);
      if (data.suggestedLabor && laborPrice === 0) {
        setLaborPrice(data.suggestedLabor);
      }
      if (data.possibleCauses && data.possibleCauses.length > 0 && !technicalReport) {
        setTechnicalReport(
          `Causas prováveis analisadas: ${data.possibleCauses.join('; ')}`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Add Item
  const handleAddItem = () => {
    const newItemId = generateUniqueId('it');
    setItems((prev) => [
      ...prev,
      {
        id: newItemId,
        description: 'Nova Peça / Insumo',
        type: 'peca',
        costPrice: 0,
        sellPrice: 0,
        quantity: 1,
      },
    ]);
  };

  // Add from stock
  const handleAddStockPart = () => {
    if (!selectedStockId) return;
    const part = stock.find((s) => s.id === selectedStockId);
    if (!part) return;

    const stockItemId = generateUniqueId('it');
    setItems((prev) => [
      ...prev,
      {
        id: stockItemId,
        description: `${part.name}`,
        type: 'peca',
        costPrice: part.costPrice,
        sellPrice: part.sellPrice,
        quantity: 1,
      },
    ]);
    setSelectedStockId('');
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof BudgetOSItem, value: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Assemble full BudgetOS object
  const buildCurrentBudget = (): BudgetOS => {
    return {
      id: initialBudget?.id || generateUniqueId('os'),
      code: code || nextCode,
      type,
      status,
      createdAt: initialBudget?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deliveryDate,
      finishedAt: status === 'entregue' ? new Date().toISOString() : undefined,
      client: {
        name: clientName.trim() || 'Cliente Não Informado',
        phone: clientPhone.trim(),
        document: clientDoc.trim() || undefined,
        email: clientEmail.trim() || undefined,
      },
      device: {
        brand: deviceBrand,
        model: deviceModel.trim() || 'Modelo Não Especificado',
        color: deviceColor.trim() || undefined,
        imeiOrSerial: deviceImei.trim() || undefined,
        passcodeOrPattern: devicePasscode.trim() || undefined,
        conditionNotes: deviceCondition.trim() || undefined,
      },
      checklist,
      problemDescription: problemDescription.trim(),
      technicalReport: technicalReport.trim(),
      items,
      laborPrice: Number(laborPrice) || 0,
      discount: Number(discount) || 0,
      totalAmount,
      totalPartsCost: partsCostTotal,
      grossProfit,
      paymentMethod,
      paymentStatus,
      paidAmount: paymentStatus === 'pago' ? totalAmount : 0,
      warrantyDays: Number(warrantyDays) || 90,
      internalNotes: internalNotes.trim() || undefined,
    };
  };

  const handleSaveOnly = () => {
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      setActiveTab('client_device');
      return;
    }
    const b = buildCurrentBudget();
    onSave(b);
    onClose();
  };

  const handleSaveAndPDF = () => {
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      setActiveTab('client_device');
      return;
    }
    const b = buildCurrentBudget();
    onSave(b);
    generateBudgetPDF(b, settings);
    onClose();
  };

  const handleSaveAndWhatsApp = () => {
    if (!clientName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      setActiveTab('client_device');
      return;
    }
    const b = buildCurrentBudget();
    onSave(b);
    const { url } = createWhatsAppBudgetUrl(b, settings, 'orcamento');
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {initialBudget ? `Editar OS #${initialBudget.code}` : `Novo Atendimento #${code}`}
                </h2>
                <span className="text-xs font-mono text-cyan-400 font-semibold bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                  Barreto Cell
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Preencha os dados do cliente, aparelho, peças utilizadas e mão de obra.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-2">
          <button
            onClick={() => setActiveTab('client_device')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'client_device'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Cliente, Aparelho & Defeito
          </button>

          <button
            onClick={() => setActiveTab('parts_labor')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'parts_labor'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Peças, Mão de Obra & Lucro
          </button>

          <button
            onClick={() => setActiveTab('delivery_terms')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'delivery_terms'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Prazo, Pagamento & Garantia
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CLIENT & DEVICE */}
          {activeTab === 'client_device' && (
            <div className="space-y-6">
              {/* Type and Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as OSType)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="orcamento">Orçamento Preliminar</option>
                    <option value="ordem_servico">Ordem de Serviço (OS Oficial)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Status da OS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OSStatus)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="orcamento_pendente">Orçamento Pendente (Aguard. Aprovação)</option>
                    <option value="aprovado">Aprovado pelo Cliente</option>
                    <option value="em_reparo">Na Bancada (Em Reparo)</option>
                    <option value="aguardando_peca">Aguardando Chegada de Peça</option>
                    <option value="pronto">Pronto para Retirada</option>
                    <option value="entregue">Entregue & Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Código Identificador
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono font-bold text-xs rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Client Data */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Dados do Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos Eduardo Santos"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">WhatsApp (Celular) *</label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 98765-4321"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">CPF (Opcional)</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={clientDoc}
                      onChange={(e) => setClientDoc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Device Data */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Dados do Aparelho
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Marca</label>
                    <select
                      value={deviceBrand}
                      onChange={(e) => setDeviceBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Apple">Apple (iPhone / iPad)</option>
                      <option value="Samsung">Samsung Galaxy</option>
                      <option value="Motorola">Motorola Moto</option>
                      <option value="Xiaomi">Xiaomi / Redmi / POCO</option>
                      <option value="Realme">Realme</option>
                      <option value="LG">LG</option>
                      <option value="Asus">Asus ROG / Zenfone</option>
                      <option value="Outra">Outra Marca</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modelo Exato *</label>
                    <input
                      type="text"
                      placeholder="Ex: iPhone 13 Pro 128GB"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Cor do Aparelho</label>
                    <input
                      type="text"
                      placeholder="Ex: Azul Meia-Noite, Grafite"
                      value={deviceColor}
                      onChange={(e) => setDeviceColor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">IMEI ou Nº de Série</label>
                    <input
                      type="text"
                      placeholder="Ex: 356987123456789"
                      value={deviceImei}
                      onChange={(e) => setDeviceImei(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Senha de Desbloqueio (Para testes na bancada)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1234, Desenho L ou Sem Senha"
                      value={devicePasscode}
                      onChange={(e) => setDevicePasscode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Estado Estético de Entrada (Avarias prévias)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Trincas no vidro, riscos nas laterais, marcas de chave"
                      value={deviceCondition}
                      onChange={(e) => setDeviceCondition(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Checklist de Entrada */}
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Checklist Rápido de Recepção de Bancada
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Proteção jurídica para a Barreto Cell e transparência com o cliente
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                  {[
                    { key: 'screenBroken', label: 'Tela Quebrada / Trincada' },
                    { key: 'touchOk', label: 'Touch Funcionando 100%' },
                    { key: 'camerasOk', label: 'Câmeras OK' },
                    { key: 'chargingOk', label: 'Carrega no Cabo' },
                    { key: 'wifiOk', label: 'Wi-Fi / Bluetooth OK' },
                    { key: 'micSpeakerOk', label: 'Microfone & Som OK' },
                    { key: 'biometricsOk', label: 'FaceID / Biometria OK' },
                    { key: 'waterDamage', label: 'Histórico de Contato com Água' },
                  ].map(({ key, label }) => {
                    const checked = (checklist as any)[key];
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-200'
                            : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setChecklist({ ...checklist, [key]: e.target.checked })
                          }
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className="text-[11px] select-none">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Defeito e Assistente IA */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Defeito Relatado pelo Cliente *
                  </label>

                  <button
                    type="button"
                    onClick={handleRunAiDiagnosis}
                    disabled={isAiLoading}
                    className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all shadow cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiLoading ? 'Analisando Bancada...' : 'Triagem Técnica IA'}</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder="Ex: Celular caiu no chão, tela apagou completamente mas o aparelho vibra quando conecta no carregador..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />

                {/* AI Suggestions Box */}
                {aiSuggestions && (
                  <div className="p-4 bg-slate-950/90 border border-cyan-800/50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Diagnóstico Sugerido pela IA Barreto Cell
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Dificuldade: <strong className="text-white">{aiSuggestions.difficulty}</strong> ·
                        Tempo: <strong className="text-white">{aiSuggestions.estimatedMinutes} min</strong>
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="font-medium text-slate-200">Possíveis Causas:</div>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                        {aiSuggestions.possibleCauses?.map((cause: string, i: number) => (
                          <li key={i}>{cause}</li>
                        ))}
                      </ul>
                    </div>

                    {aiSuggestions.clientAdvice && (
                      <div className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                        <span className="font-semibold text-cyan-300">Explicação para o Cliente: </span>
                        {aiSuggestions.clientAdvice}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Laudo Técnico / Observações da Bancada (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Testado na fonte, consumo estável em 0.45A. Necessária substituição da tela frontal completa."
                    value={technicalReport}
                    onChange={(e) => setTechnicalReport(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTS & LABOR & PROFIT */}
          {activeTab === 'parts_labor' && (
            <div className="space-y-6">
              {/* Quick Stock Selector */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">
                    Puxar Peça Direto do Estoque:
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">Selecione uma peça cadastrada no estoque...</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Qtd: {s.quantity} | Custo: R$ {s.costPrice} | Venda: R$ {s.sellPrice})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddStockPart}
                    disabled={!selectedStockId}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-400 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Peças & Componentes Utilizados
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Item Avulso</span>
                  </button>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                        <th className="py-2.5 px-3">Descrição da Peça / Serviço</th>
                        <th className="py-2.5 px-3 w-20 text-center">Qtd</th>
                        <th className="py-2.5 px-3 w-32 text-right">
                          Custo Loja (R$)
                          <span className="block text-[9px] text-slate-500">Não sai no PDF</span>
                        </th>
                        <th className="py-2.5 px-3 w-32 text-right">Preço Cliente (R$)</th>
                        <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                            Nenhuma peça inserida. Se for apenas reparo/limpeza de bancada, preencha apenas a Mão de Obra abaixo.
                          </td>
                        </tr>
                      ) : (
                        items.map((it) => (
                          <tr key={it.id} className="hover:bg-slate-900/40">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={it.description}
                                onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) => handleUpdateItem(it.id, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-14 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-slate-100 text-xs text-center focus:border-cyan-500 focus:outline-none font-mono"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.5"
                                value={it.costPrice}
                                onChange={(e) => handleUpdateItem(it.id, 'costPrice', parseFloat(e.target.value) || 0)}
                                className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-amber-400 text-xs text-right focus:border-cyan-500 focus:outline-none font-mono"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="1"
                                value={it.sellPrice}
                                onChange={(e) => handleUpdateItem(it.id, 'sellPrice', parseFloat(e.target.value) || 0)}
                                className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 text-xs text-right focus:border-cyan-500 focus:outline-none font-mono"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-white">
                              {formatCurrency(it.sellPrice * it.quantity)}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(it.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Labor & Discount Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mão de Obra Técnica Especializada (R$)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Valor do serviço de abertura, testes e montagem técnica
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                      R$
                    </span>
                    <input
                      type="number"
                      step="5"
                      value={laborPrice}
                      onChange={(e) => setLaborPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono font-bold text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Desconto Promocional (R$)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Desconto negociado com o cliente para fechamento
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 text-xs font-mono">
                      - R$
                    </span>
                    <input
                      type="number"
                      step="5"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full pl-11 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono font-bold text-rose-400 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Profit Card (For Barreto Cell Owner) */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-800/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    Resumo do Lucro Desta Ordem de Serviço
                  </span>
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    Margem: {marginPercent.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-400">Total Cobrado do Cliente</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-amber-400">Custo Total em Peças</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                      {formatCurrency(partsCostTotal)}
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/40 rounded-lg border border-cyan-700/60">
                    <div className="text-[11px] text-cyan-300 font-medium">Lucro Líquido no Bolso</div>
                    <div className="text-xl font-extrabold font-mono text-cyan-300 mt-1">
                      {formatCurrency(grossProfit)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERY, PAYMENT & WARRANTY */}
          {activeTab === 'delivery_terms' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Previsão de Entrega
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="pix">PIX (Instantâneo)</option>
                    <option value="dinheiro">Dinheiro em Espécie</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pendente">A Definir na Retirada</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Status do Pagamento
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="pendente">Pagamento Pendente</option>
                    <option value="pago">Totalmente Pago</option>
                    <option value="parcial">Sinal / Pago Parcial</option>
                  </select>
                </div>
              </div>

              {/* Warranty Days */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                  <Shield className="w-4 h-4" />
                  <span>Termos de Garantia Barreto Cell</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <label className="text-[11px] text-slate-400 block mb-1">Prazo de Garantia (Dias)</label>
                    <select
                      value={warrantyDays}
                      onChange={(e) => setWarrantyDays(parseInt(e.target.value) || 90)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
                    >
                      <option value="30">30 dias</option>
                      <option value="90">90 dias (Padrão Legal CDC)</option>
                      <option value="180">180 dias (6 meses)</option>
                      <option value="365">365 dias (1 ano)</option>
                    </select>
                  </div>
                  <div className="text-xs text-slate-400">
                    A garantia legal de 90 dias cobre defeitos de fabricação das peças substituídas.
                    Não cobre quedas posteriores, trincas ou contato com líquidos.
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Notas Internas da Oficina (Apenas para o técnico)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Peça encomendada na TechParts com previsão de chegada amanhã às 10h. Cliente tem pressa..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total do Orçamento:</span>
            <span className="text-lg font-bold font-mono text-cyan-300">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Salvar Orçamento
            </button>

            <button
              type="button"
              onClick={handleSaveAndPDF}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Salvar & Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
              <span>Salvar & Enviar WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
