export interface ProductSpec {
  resolution: string;
  software: string;
  size: string;
  updates: string;
  slidesCount?: string;
  fileFormat?: string;
}

export interface Product {
  id: number | string;
  title: string;
  format: string; 
  price: number; 
  category: string;
  img: string;
  creator: string;
  creator_id?: string;
  stripe_price_id?: string;
  file_path?: string; // ADICIONADO: Para o download seguro
  description: string;
  long_description?: string;
  features: string[];
  specs: {
    resolution: string;
    software: string;
    size: string;
    updates: string;
    slidesCount?: string;
    fileFormat?: string;
  };
  rating?: number; // ADICIONADO: Para a nota das estrelas
  downloads?: number;
  views?: number;
  status?: 'analyzing' | 'approved' | 'declined' | 'active';
}

export interface Transaction {
  id: string;
  date: string;
  type: string; 
  source: string;
  amount: number; 
  status: 'success' | 'pending' | 'expense';
}

// --- CORREÇÃO AQUI: Criando e exportando o UserRole ---
export type UserRole = 'Admin' | 'Moderador' | 'User' | 'Suporte';

export interface UserProfile {
  username: string;
  email: string;
  bio: string;
  avatar: string;
  verified: boolean;
  memberSince: string;
  role?: UserRole; // Agora usa o tipo exportado acima
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