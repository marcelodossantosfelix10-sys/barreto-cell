import { BudgetOS, StoreSettings } from './types';
import { formatCurrency } from './pdfGenerator';

export const cleanPhoneForWhatsApp = (rawPhone: string): string => {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';
  // If already starts with 55 and has 12 or 13 digits, keep it
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }
  // If it's a Brazilian standard 10 or 11 digits (e.g. 11987654321), prepend 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
};

export const createWhatsAppBudgetUrl = (
  budget: BudgetOS,
  settings: StoreSettings,
  messageType: 'orcamento' | 'pronto' | 'aprovado' = 'orcamento'
): { url: string; messageText: string } => {
  const clientName = budget.client.name.split(' ')[0] || 'Cliente';
  const phone = cleanPhoneForWhatsApp(budget.client.phone);
  const device = `${budget.device.brand} ${budget.device.model}`;
  const total = formatCurrency(budget.totalAmount);
  const warranty = budget.warrantyDays || 90;

  let msg = '';

  if (messageType === 'orcamento') {
    msg = `Olá, *${clientName}*! Tudo bem? Aqui é da *${settings.storeName}* 📱\n\n`;
    msg += `Passando para enviar o seu orçamento referente à *OS #${budget.code}*:\n`;
    msg += `📱 *Aparelho:* ${device}\n`;
    msg += `🛠 *Defeito Relatado:* ${budget.problemDescription}\n`;
    if (budget.items.length > 0) {
      msg += `\n📋 *Serviços/Peças Propostos:*\n`;
      budget.items.forEach((it) => {
        msg += `• ${it.description} (${formatCurrency(it.sellPrice)})\n`;
      });
    }
    if (budget.laborPrice > 0) {
      msg += `• Mão de Obra e Testes de Bancada: ${formatCurrency(budget.laborPrice)}\n`;
    }
    if (budget.discount > 0) {
      msg += `🏷 *Desconto Especial:* - ${formatCurrency(budget.discount)}\n`;
    }
    msg += `\n💰 *VALOR TOTAL:* *${total}*\n`;
    msg += `🛡 *Garantia:* ${warranty} dias (com nota/termo)\n`;
    if (budget.deliveryDate) {
      msg += `⏱ *Previsão de Entrega:* ${new Date(budget.deliveryDate).toLocaleDateString('pt-BR')}\n`;
    }
    msg += `\n💳 *Formas de Pagamento:* PIX, Dinheiro ou Cartão de Crédito/Débito.\n`;
    msg += `🔑 *Chave PIX (${settings.pixKeyType}):* ${settings.pixKey}\n\n`;
    msg += `📄 _Acabei de gerar o PDF oficial detalhado do seu orçamento. Podemos dar início ao reparo?_`;
  } else if (messageType === 'pronto') {
    msg = `🎉 Boas notícias, *${clientName}*! Seu aparelho está *PRONTO* para retirada!\n\n`;
    msg += `📱 *${device}* (OS #${budget.code})\n`;
    msg += `✅ Todos os testes de bancada e checklist foram 100% aprovados!\n`;
    msg += `💰 *Valor a acertar:* *${total}*\n`;
    msg += `🛡 *Garantia:* ${warranty} dias\n\n`;
    msg += `📍 *Retirada na loja:* ${settings.address}\n`;
    msg += `🔑 *Chave PIX:* ${settings.pixKey}\n\n`;
    msg += `Aguardamos você na *${settings.storeName}*! 🚀`;
  } else {
    msg = `Olá *${clientName}*, confirmamos a aprovação da sua *OS #${budget.code}* (${device})!\n`;
    msg += `Seu aparelho já está na bancada técnica da *${settings.storeName}* sendo preparado com muito cuidado. Avisaremos assim que estiver 100% pronto! 👍`;
  }

  const encodedMsg = encodeURIComponent(msg);
  const targetPhone = phone || '';
  const url = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

  return { url, messageText: msg };
};
