import { BudgetOS, Expense, StockPart, StoreSettings } from './types';

const SETTINGS_KEY = 'barreto_cell_settings';
const BUDGETS_KEY = 'barreto_cell_budgets';
const EXPENSES_KEY = 'barreto_cell_expenses';
const STOCK_KEY = 'barreto_cell_stock';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Barreto Cell',
  tradeName: 'Barreto Cell Assistência Técnica Especializada',
  tagline: 'Manutenção Rápida, Peças de Qualidade e Garantia em Smartphones',
  logoUrl: '/images/barreto_cell_logo.jpg',
  cnpjCpf: '48.912.834/0001-92',
  phone: '(11) 98765-4321',
  whatsapp: '5511987654321',
  email: 'contato@barretocell.com.br',
  address: 'Rua Principal do Comércio, 450 - Centro',
  cityState: 'São Paulo - SP',
  pixKey: '11987654321',
  pixKeyType: 'Telefone',
  defaultWarrantyDays: 90,
  technicianName: 'Técnico Responsável: Carlos Barreto',
  customTerms: '1. A garantia cobre exclusivamente os serviços e peças substituídas descritos neste documento pelo prazo legal de 90 dias (CDC art. 26).\n2. A garantia perde a validade em caso de queda, trincas na tela/tampa, contato com líquidos, violação do lacre interno ou intervenção de terceiros.\n3. Aparelhos não retirados em até 90 dias após a notificação poderão ser desfeitos para cobrir custos de armazenamento conforme legislação vigente.',
  whatsappTemplate: 'Olá *{cliente}*! Aqui é da *Barreto Cell* 📱\nSegue o orçamento detalhado da sua OS *#{codigo}* para o seu *{modelo}*.\n\n🛠 *Defeito:* {defeito}\n💰 *Valor Total:* R$ {total}\n⏱ *Preço com peças e mão de obra inclusas!*\n🛡 *Garantia:* {garantia} dias\n\nPodemos confirmar a aprovação para iniciar o reparo na bancada? Qualquer dúvida estamos à disposição!',
};

export const INITIAL_STOCK: StockPart[] = [
  {
    id: 'st-01',
    name: 'Tela Frontal iPhone 11 (Incell Premium)',
    brand: 'Apple',
    compatibleModels: 'iPhone 11 (A2111, A2223)',
    category: 'tela',
    quantity: 6,
    minQuantity: 2,
    costPrice: 95.0,
    sellPrice: 280.0,
    supplier: 'Distribuidora TechParts',
  },
  {
    id: 'st-02',
    name: 'Bateria iPhone 12 / 12 Pro (Alta Capacidade)',
    brand: 'Apple',
    compatibleModels: 'iPhone 12 / 12 Pro',
    category: 'bateria',
    quantity: 4,
    minQuantity: 2,
    costPrice: 75.0,
    sellPrice: 220.0,
    supplier: 'MegaCell Componentes',
  },
  {
    id: 'st-03',
    name: 'Display Samsung Galaxy A54 5G com Aro (OLED)',
    brand: 'Samsung',
    compatibleModels: 'Galaxy A54 (SM-A546E)',
    category: 'tela',
    quantity: 3,
    minQuantity: 1,
    costPrice: 190.0,
    sellPrice: 420.0,
    supplier: 'Distribuidora TechParts',
  },
  {
    id: 'st-04',
    name: 'Conector de Carga Sub-Placa Moto G84 5G',
    brand: 'Motorola',
    compatibleModels: 'Moto G84',
    category: 'conector',
    quantity: 8,
    minQuantity: 3,
    costPrice: 22.0,
    sellPrice: 130.0,
    supplier: 'Express Peças SP',
  },
  {
    id: 'st-05',
    name: 'Bateria Xiaomi Redmi Note 12 BN5A',
    brand: 'Xiaomi',
    compatibleModels: 'Redmi Note 12 4G / 5G',
    category: 'bateria',
    quantity: 1, // Alerta de estoque baixo!
    minQuantity: 2,
    costPrice: 48.0,
    sellPrice: 160.0,
    supplier: 'MegaCell Componentes',
  },
  {
    id: 'st-06',
    name: 'Tampa Traseira Vidro iPhone XR (Branca)',
    brand: 'Apple',
    compatibleModels: 'iPhone XR',
    category: 'tampa',
    quantity: 5,
    minQuantity: 2,
    costPrice: 28.0,
    sellPrice: 140.0,
    supplier: 'Distribuidora TechParts',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-01',
    description: 'Aluguel do Ponto Comercial (Mês Corrente)',
    category: 'aluguel',
    amount: 1400.0,
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'pix',
    isRecurring: true,
  },
  {
    id: 'exp-02',
    description: 'Conta de Energia Elétrica (Enel)',
    category: 'energia_agua_internet',
    amount: 245.5,
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'pix',
    isRecurring: true,
  },
  {
    id: 'exp-03',
    description: 'Internet Fibra Óptica 600MB',
    category: 'energia_agua_internet',
    amount: 119.9,
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'cartao_credito',
    isRecurring: true,
  },
  {
    id: 'exp-04',
    description: 'Kit de Chaves Torx + Cola B-7000 e Fita Térmica Kapton',
    category: 'ferramentas_insumos',
    amount: 185.0,
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'pix',
  },
  {
    id: 'exp-05',
    description: 'DAS MEI - Imposto Mensal Assistência',
    category: 'impostos_mei',
    amount: 81.0,
    date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'pix',
    isRecurring: true,
  },
  {
    id: 'exp-06',
    description: 'Anúncios no Instagram / Tráfego Pago Local',
    category: 'marketing_divulgacao',
    amount: 150.0,
    date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'cartao_credito',
  },
];

export const INITIAL_BUDGETS: BudgetOS[] = [
  {
    id: 'os-1040',
    code: 'BC-1040',
    type: 'ordem_servico',
    status: 'entregue',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    deliveryDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    finishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    client: {
      name: 'Mariana Souza Silva',
      phone: '(11) 99123-4567',
      document: '425.871.998-02',
      email: 'mariana.silva@email.com',
    },
    device: {
      brand: 'Apple',
      model: 'iPhone 11 128GB',
      color: 'Preto',
      imeiOrSerial: '356987120485912',
      passcodeOrPattern: '2468',
      conditionNotes: 'Vidro trincado no canto superior direito. Aro com pequenas marcas.',
    },
    checklist: {
      screenBroken: true,
      touchOk: false,
      camerasOk: true,
      wifiOk: true,
      micSpeakerOk: true,
      chargingOk: true,
      biometricsOk: true,
      housingScratches: true,
      waterDamage: false,
    },
    problemDescription: 'Caiu no asfalto. Vidro quebrou e o touch parou de responder na metade da tela.',
    technicalReport: 'Testada na bancada fonte de bancada normal. Troca de frontal completa necessária.',
    items: [
      {
        id: 'it-1',
        description: 'Frontal Completa iPhone 11 Incell Premium',
        type: 'peca',
        costPrice: 95.0,
        sellPrice: 280.0,
        quantity: 1,
      },
      {
        id: 'it-2',
        description: 'Película 3D de Vidro Temperado de Brinde',
        type: 'outro',
        costPrice: 3.5,
        sellPrice: 0.0,
        quantity: 1,
      },
    ],
    laborPrice: 100.0,
    discount: 0,
    totalAmount: 380.0,
    totalPartsCost: 98.5,
    grossProfit: 281.5,
    paymentMethod: 'pix',
    paymentStatus: 'pago',
    paidAmount: 380.0,
    warrantyDays: 90,
    warrantyUntil: new Date(Date.now() + 88 * 86400000).toISOString().split('T')[0],
    internalNotes: 'Serviço rápido concluído com sucesso. Cliente super satisfeita.',
  },
  {
    id: 'os-1041',
    code: 'BC-1041',
    type: 'ordem_servico',
    status: 'pronto',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    deliveryDate: new Date().toISOString().split('T')[0],
    client: {
      name: 'Rodrigo Mendonça',
      phone: '(11) 98112-9988',
      document: '319.456.789-10',
    },
    device: {
      brand: 'Samsung',
      model: 'Galaxy A54 5G 128GB',
      color: 'Violeta',
      imeiOrSerial: '354891129485710',
      passcodeOrPattern: 'Desenho em Z',
      conditionNotes: 'Aparelho em excelente estado estético, sem arranhões.',
    },
    checklist: {
      screenBroken: false,
      touchOk: true,
      camerasOk: true,
      wifiOk: true,
      micSpeakerOk: true,
      chargingOk: false,
      biometricsOk: true,
      housingScratches: false,
      waterDamage: false,
    },
    problemDescription: 'Não reconhece o cabo do carregador. Mau contato na porta Type-C.',
    technicalReport: 'Conector de carga oxidado e com trilhas desgastadas. Necessária substituição da sub-placa dock de carga original.',
    items: [
      {
        id: 'it-3',
        description: 'Sub-Placa Dock de Carga Original Samsung A54',
        type: 'peca',
        costPrice: 35.0,
        sellPrice: 110.0,
        quantity: 1,
      },
    ],
    laborPrice: 80.0,
    discount: 10.0,
    totalAmount: 180.0,
    totalPartsCost: 35.0,
    grossProfit: 145.0,
    paymentMethod: 'pix',
    paymentStatus: 'pendente',
    warrantyDays: 90,
    internalNotes: 'Pronto na bancada aguardando o cliente retirar.',
  },
  {
    id: 'os-1042',
    code: 'BC-1042',
    type: 'orcamento',
    status: 'orcamento_pendente',
    createdAt: new Date(Date.now() - 10000000).toISOString(),
    updatedAt: new Date(Date.now() - 10000000).toISOString(),
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    client: {
      name: 'Fernanda Oliveira Lima',
      phone: '(11) 97654-3210',
      email: 'fernanda.lima@gmail.com',
    },
    device: {
      brand: 'Apple',
      model: 'iPhone 12 Pro 256GB',
      color: 'Azul Pacífico',
      imeiOrSerial: '358912389104812',
      conditionNotes: 'Bateria estufada pressionando levemente o display.',
    },
    checklist: {
      screenBroken: false,
      touchOk: true,
      camerasOk: true,
      wifiOk: true,
      micSpeakerOk: true,
      chargingOk: true,
      biometricsOk: true,
      housingScratches: true,
      waterDamage: false,
    },
    problemDescription: 'Saúde da bateria em 74%, descarrega muito rápido e reinicia sozinho quando abre a câmera.',
    technicalReport: 'Bateria em estado de degradação severa com resistência interna alta. Indicação de substituição por bateria de alta performance.',
    items: [
      {
        id: 'it-4',
        description: 'Bateria Premium iPhone 12 Pro (Chip Original sem mensagem)',
        type: 'peca',
        costPrice: 75.0,
        sellPrice: 220.0,
        quantity: 1,
      },
      {
        id: 'it-5',
        description: 'Adesivo de Vedação Impermeabilizante Original',
        type: 'insumo',
        costPrice: 6.0,
        sellPrice: 20.0,
        quantity: 1,
      },
    ],
    laborPrice: 90.0,
    discount: 0,
    totalAmount: 330.0,
    totalPartsCost: 81.0,
    grossProfit: 249.0,
    paymentMethod: 'pendente',
    paymentStatus: 'pendente',
    warrantyDays: 90,
    internalNotes: 'Orçamento enviado para a cliente via WhatsApp. Aguardando aprovação.',
  },
  {
    id: 'os-1043',
    code: 'BC-1043',
    type: 'ordem_servico',
    status: 'em_reparo',
    createdAt: new Date(Date.now() - 5000000).toISOString(),
    updatedAt: new Date(Date.now() - 2000000).toISOString(),
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    client: {
      name: 'Lucas Henrique Bastos',
      phone: '(11) 99887-1122',
    },
    device: {
      brand: 'Motorola',
      model: 'Moto G84 5G',
      color: 'Grafite',
      imeiOrSerial: '357891289190123',
    },
    checklist: {
      screenBroken: true,
      touchOk: true,
      camerasOk: true,
      wifiOk: true,
      micSpeakerOk: true,
      chargingOk: true,
      biometricsOk: true,
      housingScratches: true,
      waterDamage: false,
    },
    problemDescription: 'Display quebrou após queda da moto. Imagem apresenta listras verticais.',
    technicalReport: 'Display OLED danificado internamente. Placa e demais componentes intactos.',
    items: [
      {
        id: 'it-6',
        description: 'Display Moto G84 5G Original Nacional com Aro',
        type: 'peca',
        costPrice: 160.0,
        sellPrice: 380.0,
        quantity: 1,
      },
    ],
    laborPrice: 90.0,
    discount: 0,
    totalAmount: 470.0,
    totalPartsCost: 160.0,
    grossProfit: 310.0,
    paymentMethod: 'cartao_credito',
    paymentStatus: 'pendente',
    warrantyDays: 90,
  },
];

// Helper functions for localStorage
export const loadStoreSettings = (): StoreSettings => {
  if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw || !raw.trim()) return DEFAULT_STORE_SETTINGS;
    return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading settings', e);
    return DEFAULT_STORE_SETTINGS;
  }
};

export const saveStoreSettings = (settings: StoreSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadBudgets = (): BudgetOS[] => {
  if (typeof window === 'undefined') return INITIAL_BUDGETS;
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    if (!raw || !raw.trim()) {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BUDGETS;
  } catch (e) {
    console.error('Error loading budgets', e);
    return INITIAL_BUDGETS;
  }
};

export const saveBudgets = (budgets: BudgetOS[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const loadExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw || !raw.trim()) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_EXPENSES;
  } catch (e) {
    console.error('Error loading expenses', e);
    return INITIAL_EXPENSES;
  }
};

export const saveExpenses = (expenses: Expense[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const loadStock = (): StockPart[] => {
  if (typeof window === 'undefined') return INITIAL_STOCK;
  try {
    const raw = localStorage.getItem(STOCK_KEY);
    if (!raw || !raw.trim()) {
      localStorage.setItem(STOCK_KEY, JSON.stringify(INITIAL_STOCK));
      return INITIAL_STOCK;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STOCK;
  } catch (e) {
    console.error('Error loading stock', e);
    return INITIAL_STOCK;
  }
};

export const saveStock = (stock: StockPart[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
};

// Generate next sequential code: BC-1044, etc.
export const getNextOSCode = (budgets: BudgetOS[]): string => {
  let highest = 1043;
  budgets.forEach((b) => {
    const match = b.code.match(/BC-(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highest) highest = num;
    }
  });
  return `BC-${highest + 1}`;
};

// Export full backup
export const exportBackupJSON = () => {
  const data = {
    settings: loadStoreSettings(),
    budgets: loadBudgets(),
    expenses: loadExpenses(),
    stock: loadStock(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
    store: 'Barreto Cell',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_barreto_cell_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Import backup
export const importBackupJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) saveStoreSettings(data.settings);
    if (Array.isArray(data.budgets)) saveBudgets(data.budgets);
    if (Array.isArray(data.expenses)) saveExpenses(data.expenses);
    if (Array.isArray(data.stock)) saveStock(data.stock);
    return true;
  } catch (e) {
    console.error('Failed to parse backup', e);
    return false;
  }
};
