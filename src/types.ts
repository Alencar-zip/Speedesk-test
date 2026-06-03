export interface ProductSpec {
  resolution: string;
  software: string;
  size: string;
  updates: string;
  slidesCount?: string;
  fileFormat?: string;
}

export interface Product {
  id: number;
  title: string;
  format: string; // 'PPTX' | 'KEYNOTE' | 'FIGMA' | 'ZIP'
  price: number; // Stored as a raw number to allow easy calculations!
  category: string;
  img: string;
  creator: string;
  description: string;
  longDescription: string;
  features: string[];
  specs: ProductSpec;
  rating: number;
  downloads: number;
  views: number;
  status?: 'analyzing' | 'approved' | 'declined';
  zipFileName?: string;
  scanLogs?: Array<{ time: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>;
  scanSummary?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: string; // 'Depósito' | 'Compra' | 'Saque'
  source: string;
  amount: number; // Negative for expense, positive for gain
  status: 'success' | 'pending' | 'expense';
}

export interface UserProfile {
  username: string;
  email: string;
  bio: string;
  avatar: string;
  verified: boolean;
  memberSince: string;
  role?: 'Admin' | 'Moderador' | 'Criador' | 'Comprador' | 'Suporte';
}

export interface AppSettings {
  language: 'pt-BR' | 'en';
  theme: 'dark' | 'light' | 'system';
  marketAlerts: boolean;
  transactionsAlerts: boolean;
  marketingAlerts: boolean;
  simulateMalware?: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  productTitle?: string;
  createdAt: string;
  status: 'ai_triage' | 'human_mediation' | 'resolved';
  messages: Array<{
    id: string;
    sender: 'user' | 'model' | 'human';
    senderName: string;
    text: string;
    time: string;
  }>;
}
