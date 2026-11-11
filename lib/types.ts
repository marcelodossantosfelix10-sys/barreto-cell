export type OSStatus = 
  | 'orcamento_pendente' 
  | 'aprovado' 
  | 'em_reparo' 
  | 'aguardando_peca' 
  | 'pronto' 
  | 'entregue' 
  | 'cancelado';

export type OSType = 'orcamento' | 'ordem_servico';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pendente';
export type PaymentStatus = 'pendente' | 'pago' | 'parcial';

export interface DeviceChecklist {
  screenBroken: boolean;
  touchOk: boolean;
  camerasOk: boolean;
  wifiOk: boolean;
  micSpeakerOk: boolean;
  chargingOk: boolean;
  biometricsOk: boolean;
  housingScratches: boolean;
  waterDamage: boolean;
}

export interface BudgetOSItem {
  id: string;
  description: string;
  type: 'peca' | 'mao_de_obra' | 'insumo' | 'outro';
  costPrice: number; // Custo para a Barreto Cell (para controle de lucro)
  sellPrice: number; // Preço cobrado do cliente
  quantity: number;
}

export interface ClientData {
  name: string;
  phone: string; // WhatsApp
  document?: string; // CPF
  email?: string;
}

export interface DeviceData {
  brand: string; // Apple, Samsung, Xiaomi, Motorola, etc.
  model: string; // ex: iPhone 13 Pro, Galaxy A54
  color?: string;
  imeiOrSerial?: string;
  passcodeOrPattern?: string; // Para testes de bancada
  conditionNotes?: string;
}

export interface BudgetOS {
  id: string;
  code: string; // Ex: BC-1025
  type: OSType;
  status: OSStatus;
  createdAt: string; // ISO date
  updatedAt: string;
  deliveryDate?: string;
  finishedAt?: string;
  client: ClientData;
  device: DeviceData;
  checklist: DeviceChecklist;
  problemDescription: string;
  technicalReport: string;
  items: BudgetOSItem[];
  laborPrice: number; // Mão de obra
  discount: number;
  totalAmount: number; // Total cobrado ao cliente
  totalPartsCost: number; // Total de custo de peças
  grossProfit: number; // totalAmount - totalPartsCost
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount?: number;
  warrantyDays: number; // 90 dias padrão
  warrantyUntil?: string;
  internalNotes?: string;
}

export type ExpenseCategory = 
  | 'aluguel' 
  | 'energia_agua_internet' 
  | 'pecas_estoque' 
  | 'ferramentas_insumos' 
  | 'marketing_divulgacao' 
  | 'impostos_mei' 
  | 'alimentacao' 
  | 'outros';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO date
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  notes?: string;
}

export interface StockPart {
  id: string;
  name: string; // ex: Tela Display iPhone 11 Incell
  brand: string; // Apple
  compatibleModels: string; // iPhone 11
  category: 'tela' | 'bateria' | 'conector' | 'camera' | 'tampa' | 'carcaca' | 'acessorio' | 'outro';
  quantity: number;
  minQuantity: number;
  costPrice: number;
  sellPrice: number;
  supplier?: string;
}

export interface StoreSettings {
  storeName: string;
  tradeName: string;
  tagline: string;
  logoUrl?: string;
  cnpjCpf: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cityState: string;
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'Telefone' | 'E-mail' | 'Aleatória';
  defaultWarrantyDays: number;
  technicianName: string;
  customTerms: string;
  whatsappTemplate: string;
}
