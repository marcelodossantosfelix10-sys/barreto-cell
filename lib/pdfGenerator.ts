import { BudgetOS, StoreSettings } from './types';

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

const tryLoadImage = (url: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
    setTimeout(() => resolve(null), 1500);
  });
};

export const generateBudgetPDF = async (budget: BudgetOS, settings: StoreSettings) => {
  if (typeof window === 'undefined') return;
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 14;

  // Header Background Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'F');

  // Try adding logo
  const logoUrl = settings.logoUrl || '/images/barreto_cell_logo.jpg';
  let hasLogo = false;
  try {
    const img = await tryLoadImage(logoUrl);
    if (img) {
      doc.addImage(img, 'JPEG', margin + 4, y + 4, 20, 20);
      hasLogo = true;
    }
  } catch {
    hasLogo = false;
  }

  const textStartX = hasLogo ? margin + 28 : margin + 6;

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(settings.storeName.toUpperCase(), textStartX, y + 10);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(settings.tagline, textStartX, y + 16);
  doc.text(
    `${settings.address} - ${settings.cityState} | WhatsApp: ${settings.phone} | CNPJ: ${settings.cnpjCpf}`,
    textStartX,
    y + 22
  );

  // Document Number Badge
  const isBudget = budget.type === 'orcamento';
  const docTitle = isBudget ? 'ORÇAMENTO' : 'ORDEM DE SERVIÇO';
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pageWidth - margin - 48, y + 4, 42, 20, 2, 2, 'F');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(docTitle, pageWidth - margin - 27, y + 10, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text(budget.code, pageWidth - margin - 27, y + 18, { align: 'center' });

  y += 34;

  // Metadata Strip (Status, Data, Previsão)
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, y, pageWidth - margin * 2, 12, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('EMISSÃO:', margin + 4, y + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(budget.createdAt), margin + 22, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text('STATUS:', margin + 55, y + 7.5);
  doc.setFont('helvetica', 'normal');
  const statusLabel =
    budget.status === 'orcamento_pendente'
      ? 'Aguardando Aprovação'
      : budget.status === 'aprovado'
      ? 'Aprovado pelo Cliente'
      : budget.status === 'em_reparo'
      ? 'Em Reparo na Bancada'
      : budget.status === 'aguardando_peca'
      ? 'Aguardando Peça'
      : budget.status === 'pronto'
      ? 'Pronto para Retirada'
      : budget.status === 'entregue'
      ? 'Entregue e Finalizado'
      : 'Cancelado';
  doc.text(statusLabel, margin + 70, y + 7.5);

  if (budget.deliveryDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('PREVISÃO:', margin + 125, y + 7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(budget.deliveryDate), margin + 145, y + 7.5);
  }

  y += 16;

  // Two columns: Cliente & Aparelho
  const colWidth = (pageWidth - margin * 2 - 6) / 2;

  // Col 1: Cliente
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('DADOS DO CLIENTE', margin + 4, y + 5);

  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y + 7, colWidth, 28, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Nome:', margin + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(budget.client.name || 'Não informado', margin + 20, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('WhatsApp:', margin + 4, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(budget.client.phone || 'Não informado', margin + 24, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CPF:', margin + 4, y + 27);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(budget.client.document || 'Não informado', margin + 20, y + 27);

  if (budget.client.email) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('E-mail:', margin + 4, y + 33);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(budget.client.email, margin + 20, y + 33);
  }

  // Col 2: Aparelho
  const col2X = margin + colWidth + 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(col2X, y, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('DADOS DO APARELHO', col2X + 4, y + 5);

  doc.setDrawColor(226, 232, 240);
  doc.rect(col2X, y + 7, colWidth, 28, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Aparelho:', col2X + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${budget.device.brand || ''} ${budget.device.model || 'Não especificado'}`,
    col2X + 22,
    y + 13
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Cor:', col2X + 4, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(budget.device.color || 'Não informada', col2X + 16, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('IMEI/Série:', col2X + 4, y + 27);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(budget.device.imeiOrSerial || 'Não informado', col2X + 24, y + 27);

  if (budget.device.conditionNotes) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Estado:', col2X + 4, y + 33);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const shortCond =
      budget.device.conditionNotes.length > 34
        ? budget.device.conditionNotes.substring(0, 32) + '...'
        : budget.device.conditionNotes;
    doc.text(shortCond, col2X + 20, y + 33);
  }

  y += 40;

  // Defeito Relatado e Laudo Técnico
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 19, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('DEFEITO RECLAMADO:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const defText = doc.splitTextToSize(budget.problemDescription || 'Não relatado', pageWidth - margin * 2 - 8);
  doc.text(defText.slice(0, 2), margin + 4, y + 9);

  if (budget.technicalReport) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('LAUDO TÉCNICO:', margin + 4, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const repText = doc.splitTextToSize(budget.technicalReport, pageWidth - margin * 2 - 8);
    doc.text(repText.slice(0, 1), margin + 35, y + 14);
  }

  y += 24;

  // Items Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ITEM / DESCRIÇÃO DO SERVIÇO OU PEÇA', margin + 4, y + 4.8);
  doc.text('QTD', pageWidth - margin - 50, y + 4.8, { align: 'center' });
  doc.text('UNITÁRIO', pageWidth - margin - 26, y + 4.8, { align: 'right' });
  doc.text('SUBTOTAL', pageWidth - margin - 4, y + 4.8, { align: 'right' });

  y += 7;

  // Table Rows (Notice: internal cost is NEVER shown to the client)
  let rowCount = 0;
  budget.items.forEach((item) => {
    doc.setFillColor(rowCount % 2 === 0 ? 255 : 248, rowCount % 2 === 0 ? 255 : 250, rowCount % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const shortDesc = item.description.length > 55 ? item.description.substring(0, 52) + '...' : item.description;
    doc.text(shortDesc, margin + 4, y + 4.8);
    doc.text(String(item.quantity), pageWidth - margin - 50, y + 4.8, { align: 'center' });
    doc.text(formatCurrency(item.sellPrice), pageWidth - margin - 26, y + 4.8, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.sellPrice * item.quantity), pageWidth - margin - 4, y + 4.8, { align: 'right' });

    y += 7;
    rowCount++;
  });

  // Labor Row
  if (budget.laborPrice > 0) {
    doc.setFillColor(rowCount % 2 === 0 ? 255 : 248, rowCount % 2 === 0 ? 255 : 250, rowCount % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Mão de Obra Técnica Especializada / Testes de Bancada', margin + 4, y + 4.8);
    doc.text('1', pageWidth - margin - 50, y + 4.8, { align: 'center' });
    doc.text(formatCurrency(budget.laborPrice), pageWidth - margin - 26, y + 4.8, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(budget.laborPrice), pageWidth - margin - 4, y + 4.8, { align: 'right' });

    y += 7;
  }

  y += 2;

  // Totals Box (Right aligned)
  const totalBoxWidth = 85;
  const totalBoxX = pageWidth - margin - totalBoxWidth;

  if (budget.discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Desconto Aplicado:', totalBoxX + 4, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text(`- ${formatCurrency(budget.discount)}`, pageWidth - margin - 4, y + 5, { align: 'right' });
    y += 6;
  }

  // Total Final Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(totalBoxX, y, totalBoxWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('VALOR TOTAL:', totalBoxX + 6, y + 7.5);
  doc.setFontSize(13);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(formatCurrency(budget.totalAmount), pageWidth - margin - 4, y + 8, { align: 'right' });

  // Payment Details (Left aligned opposite to totals)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('DADOS PARA PAGAMENTO VIA PIX:', margin + 4, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Chave PIX (${settings.pixKeyType}): ${settings.pixKey}`, margin + 4, y + 8);
  doc.text(`Favorecido: ${settings.tradeName}`, margin + 4, y + 12);

  y += 20;

  // Terms and Warranty Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`TERMO DE GARANTIA (${budget.warrantyDays || 90} DIAS) E CONDIÇÕES`, margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const terms = doc.splitTextToSize(settings.customTerms, pageWidth - margin * 2 - 8);
  doc.text(terms.slice(0, 5), margin + 4, y + 9);

  y += 34;

  // Signatures
  doc.setDrawColor(148, 163, 184);
  const sigWidth = 75;

  // Client signature
  doc.line(margin + 10, y + 10, margin + 10 + sigWidth, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Assinatura do Cliente', margin + 10 + sigWidth / 2, y + 14, { align: 'center' });
  doc.text(budget.client.name, margin + 10 + sigWidth / 2, y + 18, { align: 'center' });

  // Store signature
  const sig2X = pageWidth - margin - sigWidth - 10;
  doc.line(sig2X, y + 10, sig2X + sigWidth, y + 10);
  doc.text('Barreto Cell - Visto Técnico', sig2X + sigWidth / 2, y + 14, { align: 'center' });
  doc.text(settings.technicianName, sig2X + sigWidth / 2, y + 18, { align: 'center' });

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Barreto Cell Assistência Técnica - Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 6,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `${budget.code}_Barreto_Cell_${budget.client.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
