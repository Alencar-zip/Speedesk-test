import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

interface LayoutProps {
  balance: number;
  profile: UserProfile;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onLogout: () => void;
}

export default function Layout({ balance, profile, onSearchChange, searchQuery, onLogout }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isBalanceVisible, setIsBalanceVisible] = useState(() => {
    const saved = localStorage.getItem('speedesk_balance_visible');
    return saved !== 'false';
  });
  const location = useLocation();

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => {
      const next = !prev;
      localStorage.setItem('speedesk_balance_visible', String(next));
      return next;
    });
  };

  const menuItems = [
    { name: 'Marketplace', icon: 'storefront', path: '/' },
    { name: 'Sua Coleção', icon: 'folder_open', path: '/library' },
    { name: 'Painel Criador', icon: 'shield_with_heart', path: '/creator' },
    { name: 'Carteira', icon: 'account_balance_wallet', path: '/wallet' },
    { name: 'Configurações', icon: 'settings', path: '/settings' },
    { name: 'Suporte Híbrido', icon: 'support_agent', path: '/support' },
    ...(profile.role === 'Admin' ? [{ name: 'Painel Admin', icon: 'admin_panel_settings', path: '/admin' }] : []),
  ];

  return (
    <div className="bg-[#101415] text-[#e0e3e5] min-h-screen font-body select-none">
      
      {/* 1. Header Fixo (z-50 para ficar acima de tudo) */}
      <header className="fixed top-0 w-full z-50 bg-[#101415]/95 backdrop-blur-xl border-b border-white/5 shadow-md h-16">
        <div className="flex justify-between items-center px-6 h-full w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#272a2c] rounded-xl text-primary cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/" className="text-2xl font-black text-primary tracking-tighter uppercase font-display bg-gradient-to-r from-white to-[#00e0ff] bg-clip-text text-transparent">
              Speedesk
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#191c1e] border border-white/5 h-9">
              <Link to="/wallet" className="flex items-center gap-1.5 group">
                <span className="material-symbols-outlined text-primary text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                <span className="text-xs font-mono font-bold text-[#e1e3e3]">
                  {isBalanceVisible ? `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
                </span>
              </Link>
              <button onClick={toggleBalanceVisibility} className="text-[#8b9293]/50 hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">{isBalanceVisible ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>

            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-[#272a2c] overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-[#e0e3e5]">{profile.username}</span>
                <span className="text-[9px] font-mono uppercase font-bold text-primary">
                  {profile.role || 'User'}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Container Principal */}
      <div className="flex pt-16 h-full">
        
        {/* 2. Sidebar Fixa (fixed) - não sai do lugar com o scroll */}
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 bg-[#101415] border-r border-white/5 p-3 w-64 transition-all duration-300 overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-1 mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-primary/10 text-primary border-l-4 border-l-primary font-bold' 
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2">
            <Link
              to="/publish"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#baf2ff] to-[#00e0ff] text-[#00363f] font-black uppercase text-xs tracking-widest shadow-[0_4px_20px_rgba(0,224,255,0.3)] hover:scale-102 transition-all"
            >
              <span className="material-symbols-outlined text-base font-bold">cloud_upload</span>
              <span>Publicar</span>
            </Link>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-bold uppercase text-xs font-mono cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* 3. Área de Conteúdo Principal (Margem esquerda compensa a sidebar fixa) */}
        <main 
          className={`flex-1 min-w-0 transition-all duration-300 py-8 px-6 lg:px-12 ${
            isSidebarOpen ? 'md:ml-64' : 'ml-0'
          }`}
        >
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}