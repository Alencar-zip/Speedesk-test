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
  const navigate = useNavigate();

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

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate('/');
    }
  };

  return (
    <div className="bg-[#101415] text-[#e0e3e5] min-h-screen font-body select-none">

      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-[#101415] border-b border-white/5 shadow-md">
        <div className="flex justify-between items-center px-3 sm:px-4 lg:px-6 h-16 max-w-full">

          {/* Logo & Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#272a2c] rounded-xl transition-colors cursor-pointer text-primary"
              id="menu-toggle-btn"
              title="Menu"
            >
              <span className="material-symbols-outlined select-none align-middle">menu</span>
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-primary tracking-tighter uppercase font-display bg-gradient-to-r from-[#ffffff] to-[#00e0ff] bg-clip-text text-transparent">
                Speedesk
              </span>
            </Link>
          </div>

          {/* Global Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4 items-center bg-[#191c1e] rounded-xl px-4 py-1.5 border border-white/5 focus-within:border-primary/40 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant text-sm select-none">search</span>
            <input
              type="text"
              placeholder="Buscar apresentações..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="bg-transparent border-none-custom font-body text-sm w-full pl-3 pr-2 py-1 placeholder:text-[#bac9cd]/40 text-[#e0e3e5] outline-none focus:ring-0"
              id="global-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
                title="Limpar busca"
              >
                <span className="material-symbols-outlined text-xs select-none">close</span>
              </button>
            )}
          </div>

          {/* User Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            {/* Wallet Quick Indicator */}
            <div
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-[#191c1e] border border-white/5 hover:border-primary/20 transition-all select-none h-9"
              id="header-wallet-btn"
            >
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 group cursor-pointer select-none"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[17px] text-primary align-middle group-hover:scale-105 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                <span className="text-xs font-mono font-bold text-[#e1e3e3] hidden md:inline-block select-none whitespace-nowrap">
                  {isBalanceVisible
                    ? `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '••••••'
                  }
                </span>
              </Link>
              <button
                onClick={toggleBalanceVisibility}
                className="text-[#8b9293]/50 hover:text-primary transition-opacity cursor-pointer flex items-center justify-center p-0.5 bg-transparent border-none outline-none select-none"
                title={isBalanceVisible ? "Ocultar Saldo" : "Mostrar Saldo"}
              >
                <span className="material-symbols-outlined text-[14px] select-none leading-none">
                  {isBalanceVisible ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            {/* User Profile Thumbnail */}
            <Link
              to="/profile"
              className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer"
              id="header-profile-btn"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#272a2c] overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#191c1e] text-[#8b9293]">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#8b9293]/80" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-[#e0e3e5] group-hover:text-primary transition-colors leading-tight">{profile.username}</span>
                <span className={`text-[9px] font-mono uppercase tracking-wider leading-none font-bold ${profile.role === 'Admin'
                  ? 'text-primary'
                  : profile.role === 'Suporte'
                    ? 'text-[#c0c1ff]'
                    : 'text-on-surface-variant'
                  }`}>
                  {profile.role ? profile.role : 'Trader VIP'}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">

        {/* Sidebar Left */}
        <aside
          className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] z-40 bg-[#101415] border-r border-white/5 p-3 w-56 sm:w-60 md:w-56 lg:w-64 transition-all duration-300 overflow-y-auto ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full md:w-0 md:p-0 md:border-r-0 md:opacity-0 pointer-events-none'
            }`}
          id="main-sidebar"
        >
          {/* Navigation Links */}
          {isSidebarOpen && (
            <nav className="flex flex-col gap-1 mb-6">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative ${isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-4 border-l-primary'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                      }`}
                    id={`sidebar-link-${item.path.replace('/', 'home')}`}
                  >
                    <span className={`material-symbols-outlined text-lg transition-transform duration-200 shrink-0 ${isActive ? 'text-primary scale-105' : 'text-[#bac9cd]/70 group-hover:text-primary-container'
                      }`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                      {item.icon}
                    </span>
                    <span className="text-xs sm:text-sm tracking-tight truncate">{item.name}</span>

                    {/* Hover Glow Pill */}
                    {isActive && (
                      <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,224,255,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Speedesk PRO Subscription Card */}
          {isSidebarOpen && (
            <Link
              to="/settings?tab=plan"
              className="mx-0.5 p-3 rounded-lg bg-gradient-to-br from-[#1d2022] to-[#101415] border border-white/5 hover:border-primary/30 shadow-md block transition-all hover:scale-101 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-[9px] font-mono text-[#baf2ff] uppercase tracking-widest font-bold">Plano</p>
                <span className="material-symbols-outlined text-xs text-[#baf2ff] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
              </div>
              <p className="text-xs font-bold text-white leading-tight">Assinatura PRO</p>
              <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-[#baf2ff] shadow-[0_0_8px_#baf2ff]"></div>
              </div>
            </Link>
          )}

          {/* EYE-CATCHING CREATOR STUDIO UPLOAD BUTTON */}
          {isSidebarOpen && (
            <div className="mt-3 mx-0.5">
              <Link
                to="/publish"
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#baf2ff] to-[#00e0ff] text-[#00363f] font-black uppercase text-xs tracking-widest shadow-[0_4px_20px_rgba(0,224,255,0.4)] hover:shadow-[0_4px_25px_rgba(0,224,255,0.7)] hover:scale-102 transition-all duration-300 cursor-pointer"
                id="sidebar-publish-btn"
              >
                <span className="material-symbols-outlined text-base font-bold">cloud_upload</span>
                <span className="hidden sm:inline">Publicar</span>
              </Link>
            </div>
          )}

          {/* Sign Out Trigger Button */}
          {isSidebarOpen && (
            <div className="mt-3 mx-0.5">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-black uppercase text-xs tracking-wider cursor-pointer font-mono"
                id="sidebar-logout-btn"
                title="Sair do Workspace"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 px-3 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-full w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
