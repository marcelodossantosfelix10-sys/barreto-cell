'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  Smartphone, 
  Building, 
  Shield, 
  MessageSquare,
  QrCode,
  Image as ImageIcon,
  Upload,
  RotateCcw
} from 'lucide-react';
import { StoreSettings } from '../lib/types';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSave: (newSettings: StoreSettings) => void;
}

export default function StoreSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: StoreSettingsModalProps) {
  const [formData, setFormData] = useState<StoreSettings>(settings);

  if (!isOpen) return null;

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('logoUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    handleChange('logoUrl', '/images/barreto_cell_logo.jpg');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Configurações da Loja · Barreto Cell
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Logomarca da Loja */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Logomarca da Assistência Técnica
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-cyan-500/40 shadow-lg bg-slate-900 shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.logoUrl || '/images/barreto_cell_logo.jpg'}
                  alt="Pré-visualização da Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = '/images/barreto_cell_logo.jpg';
                  }}
                />
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left w-full">
                <p className="text-slate-300 font-medium text-xs">
                  Esta logo é exibida no topo do sistema, nas impressões e nos orçamentos em PDF enviados aos clientes.
                </p>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors shadow-sm text-xs">
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Mudar Imagem da Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/60 cursor-pointer text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Logo Barreto Cell</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Gerais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Identificação & Endereço
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">CNPJ ou CPF</label>
                <input
                  type="text"
                  value={formData.cnpjCpf}
                  onChange={(e) => handleChange('cnpjCpf', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Slogan / Subtítulo</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Endereço da Oficina</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Cidade / Estado</label>
                <input
                  type="text"
                  value={formData.cityState}
                  onChange={(e) => handleChange('cityState', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contato & PIX */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h3 className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              WhatsApp & Chave PIX (Para Recebimento)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  WhatsApp da Loja (Com DDD) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">E-mail de Contato</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-slate-300 font-medium block mb-1">
                  Chave PIX da Barreto Cell *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 11987654321 ou chave aleatória"
                  value={formData.pixKey}
                  onChange={(e) => handleChange('pixKey', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-cyan-300 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tipo de Chave</label>
                <select
                  value={formData.pixKeyType}
                  onChange={(e) => handleChange('pixKeyType', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Telefone">Telefone</option>
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Aleatória">Chave Aleatória</option>
                </select>
              </div>
            </div>
          </div>

          {/* Garantia & Termos */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h3 className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Termos de Garantia do Documento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Garantia Padrão (Dias)
                </label>
                <input
                  type="number"
                  value={formData.defaultWarrantyDays}
                  onChange={(e) =>
                    handleChange('defaultWarrantyDays', parseInt(e.target.value) || 90)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Técnico Responsável (Assinatura)
                </label>
                <input
                  type="text"
                  value={formData.technicianName}
                  onChange={(e) => handleChange('technicianName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Cláusulas de Garantia (Exibidas no rodapé do PDF)
              </label>
              <textarea
                rows={3}
                value={formData.customTerms}
                onChange={(e) => handleChange('customTerms', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 text-[11px] focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg transition-colors shadow cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
