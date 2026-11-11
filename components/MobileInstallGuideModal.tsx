'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  MessageCircle, 
  Share2, 
  Download, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface MobileInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileInstallGuideModal({
  isOpen,
  onClose,
}: MobileInstallGuideModalProps) {
  const [copied, setCopied] = useState(false);
  const [platformTab, setPlatformTab] = useState<'android' | 'iphone'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Default to shared app URL
  const sharedUrl = 'https://ais-pre-53thswuvdwvfsuri4fonim-432485439988.us-west2.run.app';
  const currentUrl = typeof window !== 'undefined' ? (window.location.origin.includes('localhost') ? sharedUrl : window.location.href) : sharedUrl;

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(sharedUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = sharedUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📱 Link de acesso Barreto Cell no celular:\n${sharedUrl}\n\nAbra o link e toque em "Adicionar à tela inicial" para instalar como aplicativo!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(sharedUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Como Usar no Celular
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                  PWA Instalável
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Acesse em qualquer smartphone e instale como um app nativo na sua tela inicial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Quick Action Native Install Banner (if triggered) */}
          {isInstallable && (
            <div className="bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-white font-medium">Navegador compatível detectado! Deseja instalar agora?</span>
              </div>
              <button
                onClick={handleNativeInstall}
                className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar no Dispositivo</span>
              </button>
            </div>
          )}

          {/* Step 1: Scan QR Code or Open Link */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              1. Aponte a câmera do celular ou abra o link
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* QR Code Container */}
              <div className="relative p-2.5 bg-white rounded-xl shadow-lg border border-slate-700 shrink-0 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="QR Code de Acesso no Celular"
                  className="w-36 h-36 rounded-lg object-contain mx-auto"
                />
                <span className="text-[10px] font-bold text-slate-900 block mt-1">
                  Escanear com a Câmera
                </span>
              </div>

              {/* Link Details and Actions */}
              <div className="space-y-3 flex-1 w-full">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                    Link público para abrir no celular:
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg p-2 font-mono text-[11px] text-cyan-300 break-all select-all">
                    <span className="flex-1 truncate">{sharedUrl}</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                      title="Copiar Link"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950" />
                    <span>Enviar link para meu WhatsApp</span>
                  </button>

                  <a
                    href={sharedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/60"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar no Navegador</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Install as App on Home Screen */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                2. Como Adicionar à Tela Inicial (Sem baixar na loja)
              </h3>

              {/* Platform Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPlatformTab('android')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    platformTab === 'android'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Android (Chrome)
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformTab('iphone')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    platformTab === 'iphone'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  iPhone / iOS (Safari)
                </button>
              </div>
            </div>

            {/* Android Instructions */}
            {platformTab === 'android' && (
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Abra o link no Google Chrome</strong> no seu celular.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Toque no menu de <strong className="text-white">3 pontinhos (⋮)</strong> no canto superior direito do navegador.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Selecione a opção <strong className="text-white">&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong className="text-white">&ldquo;Adicionar à tela inicial&rdquo;</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    Pronto! O ícone da <strong className="text-white">Barreto Cell</strong> será criado na sua tela de início e abrirá em tela cheia como se fosse um app da Google Play Store.
                  </div>
                </div>
              </div>
            )}

            {/* iPhone Instructions */}
            {platformTab === 'iphone' && (
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    Abra o link no navegador <strong className="text-white">Safari</strong> do iPhone.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Toque no botão <strong className="text-white">Compartilhar</strong> (o ícone de quadrado com uma setinha para cima <span className="font-mono text-cyan-400">⎋</span> na barra inferior).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Role as opções para baixo e toque em <strong className="text-white">&ldquo;Adicionar à Tela de Início&rdquo;</strong> (ícone com símbolo de +).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    Toque em <strong className="text-white">&ldquo;Adicionar&rdquo;</strong> no canto superior direito. O app Barreto Cell aparecerá na sua tela inicial com ícone próprio e sem barra do navegador!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dica: No celular, o aplicativo funciona offline para consultas rápidas de bancada.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
