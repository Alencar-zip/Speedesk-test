import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile, AppSettings } from '../types';

interface SettingsProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
}

export default function Settings({ profile, settings, onUpdateProfile, onUpdateSettings }: SettingsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';

  // Account Information form states
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar || '');

  // Subscription plan states (Simulated state for interactivity)
  const [currentTier, setCurrentTier] = useState<'Básico' | 'PRO'>('PRO');
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState([
    { id: 'INV-4920', date: '03/05/2026', total: 'R$ 29,90', status: 'pago' },
    { id: 'INV-3104', date: '03/04/2026', total: 'R$ 29,90', status: 'pago' },
    { id: 'INV-0291', date: '03/03/2026', total: 'R$ 29,90', status: 'pago' },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Por favor, escolha uma imagem com menos de 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ username, email, bio, avatar });
    alert('Informações do Perfil atualizadas com sucesso!');
  };

  const toggleMarketing = () => {
    onUpdateSettings({ marketingAlerts: !settings.marketingAlerts });
  };

  const toggleTransactions = () => {
    onUpdateSettings({ transactionsAlerts: !settings.transactionsAlerts });
  };

  // User Interactive Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletPin, setWalletPin] = useState('5812');
  const [showPinInput, setShowPinInput] = useState(false);
  const [tempPin, setTempPin] = useState('');
  const [revealPin, setRevealPin] = useState(false);

  const [activeSessions, setActiveSessions] = useState([
    { id: '1', device: 'Chrome no Windows (São Paulo, BR)', ip: '186.221.45.109', current: true, date: 'Ativo agora' },
    { id: '2', device: 'Safari no iPhone (Salvador, BR)', ip: '177.85.12.30', current: false, date: 'Ontem às 18:42' },
  ]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Por favor, preencha todos os campos de senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não correspondem.');
      return;
    }
    alert('Sua senha de segurança foi alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };



  const handleUpdateWalletPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPin.length !== 4 || isNaN(Number(tempPin))) {
      alert('O PIN de segurança deve possuir exatamente 4 dígitos numéricos.');
      return;
    }
    setWalletPin(tempPin);
    setShowPinInput(false);
    setTempPin('');
    alert('PIN de segurança da Carteira cadastrado com sucesso! Suas próximas transações de saque Pix exigirão autorização.');
  };

  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    alert('Sessão remota encerrada com sucesso!');
  };

  const handleUpgradePlan = (tier: 'Básico' | 'PRO') => {
    if (tier === currentTier) return;
    setIsProcessingUpgrade(true);

    setTimeout(() => {
      setCurrentTier(tier);
      setIsProcessingUpgrade(false);
      
      const newInvoice = {
        id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date().toLocaleDateString('pt-BR'),
        total: tier === 'PRO' ? 'R$ 29,90' : 'Grátis',
        status: 'pago'
      };
      setInvoiceHistory(prev => [newInvoice, ...prev]);
      
      alert(`Parabéns! Sua assinatura foi atualizada com sucesso para a categoria ${tier}!`);
    }, 1500);
  };

  const handleCancelSubscription = () => {
    const confirm = window.confirm('Deseja realmente cancelar os benefícios recorrentes de sua assinatura? Você será rebaixado para o plano Básico (Gratuito).');
    if (confirm) {
      setCurrentTier('Básico');
      alert('Sua assinatura foi cancelada. Benefícios da conta foram reduzidos para o plano Básico.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Configurações</h1>
        <p className="text-xs text-on-surface-variant">Gerencie seu perfil, assinatura, controles de segurança e preferências da interface.</p>
      </header>

      {/* Horizontal Mobile Navigation Tabs Selector */}
      <div className="lg:hidden flex border-b border-white/5 mb-6 overflow-x-auto gap-2 pb-2 scrollbar-none">
        <button 
          onClick={() => setSearchParams({ tab: 'general' })}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all uppercase tracking-wide border ${
            activeTab === 'general' 
              ? 'bg-primary/10 border-primary text-primary' 
              : 'border-white/5 text-on-surface-variant hover:text-white hover:bg-white/5'
          }`}
        >
          Geral & Perfil
        </button>
        <button 
          onClick={() => setSearchParams({ tab: 'security' })}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all uppercase tracking-wide border ${
            activeTab === 'security' 
              ? 'bg-primary/10 border-primary text-primary' 
              : 'border-white/5 text-on-surface-variant hover:text-white hover:bg-white/5'
          }`}
        >
          Segurança
        </button>
        <button 
          onClick={() => setSearchParams({ tab: 'plan' })}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all uppercase tracking-wide border ${
            activeTab === 'plan' 
              ? 'bg-primary/10 border-primary text-primary' 
              : 'border-white/5 text-on-surface-variant hover:text-white hover:bg-white/5'
          }`}
        >
          Valores & Plano
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Desktop navigation tabs column */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-[#191c1e] border border-white/5 rounded-2xl p-2 sticky top-24 space-y-1">
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setSearchParams({ tab: 'general' })}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold transition-all uppercase tracking-wide ${
                  activeTab === 'general' 
                    ? 'bg-primary/10 text-primary border-l-2 border-l-primary' 
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                Geral & Perfil
              </button>
              <button 
                onClick={() => setSearchParams({ tab: 'security' })}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-bold transition-all uppercase tracking-wide ${
                  activeTab === 'security' 
                    ? 'bg-primary/10 text-primary border-l-2 border-l-primary' 
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                Segurança
              </button>
              <button 
                onClick={() => setSearchParams({ tab: 'plan' })}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono font-extrabold transition-all uppercase tracking-wide flex items-center justify-between ${
                  activeTab === 'plan' 
                    ? 'bg-primary/10 text-primary border-l-2 border-l-primary' 
                    : 'text-[#baf2ff] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Plano & Assinatura</span>
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00e0ff]" />
              </button>
            </nav>
          </div>
        </div>

        {/* Right Side: Account Forms & Settings Content Panel */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: GENERAL & PROFILE */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fade-in">
              {/* Section: Profile Form */}
              <section className="bg-[#1d2022] rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
                  <h3 className="font-bold font-display text-white text-sm uppercase tracking-wider">Dados do seu Perfil</h3>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                  {/* Foto de Perfil Editor */}
                  <div className="flex flex-col gap-4 p-4 rounded-xl bg-[#101415]/40 border border-white/5 mb-2">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Foto de Perfil</span>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Avatar preview */}
                      <div className="relative w-23 h-23 shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-[#c0c1ff] rounded-full blur-sm opacity-40" />
                        <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 bg-surface-dim flex items-center justify-center">
                          {avatar ? (
                            <img 
                              src={avatar} 
                              alt="Pré-visualização do perfil" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-container text-[#8b9293]">
                              <svg className="w-12 h-12 text-[#8b9293]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-wrap gap-2">
                          <label className="bg-primary/10 hover:bg-primary/25 border border-primary/20 text-primary hover:text-white font-mono text-[10px] font-bold px-3 py-2 rounded-xl transition-all uppercase cursor-pointer flex items-center gap-1.5 select-none">
                            <span className="material-symbols-outlined text-xs select-none">upload</span>
                            Enviar Imagem
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                          </label>

                          {avatar && (
                            <button
                              type="button"
                              onClick={() => setAvatar('')}
                              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-mono text-[10px] font-bold px-3 py-2 rounded-xl transition-all uppercase cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-xs">delete</span>
                              Remover Foto
                            </button>
                          )}
                        </div>

                        <p className="text-[10px] text-on-surface-variant/70 leading-relaxed font-body">
                          Envie um arquivo JPG, PNG ou GIF de até 2MB, ou selecione uma de nossas artes predefinidas abaixo. Se nenhuma foto estiver ativa, usaremos o avatar clássico padrão.
                        </p>
                      </div>
                    </div>

                    {/* Predefined Presets Carousel */}
                    <div className="pt-2.5 border-t border-white/5">
                      <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider block mb-2">Artes exclusivas para Membros</span>
                      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                        {[
                          { name: 'Neon Purple', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60' },
                          { name: 'Aether Blue', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=60' },
                          { name: 'Golden Sun', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=60' },
                          { name: 'Matrix Green', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=150&auto=format&fit=crop&q=60' },
                          { name: 'Futuristic Red', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60' }
                        ].map((preset) => {
                          const isSelected = avatar === preset.url;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setAvatar(preset.url)}
                              className={`relative w-12 h-12 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer ${
                                isSelected ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-white/5 hover:border-white/20'
                              }`}
                              title={preset.name}
                            >
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[12px] font-bold text-black bg-primary rounded-full p-0.5 select-none leading-none">check</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Pseudônimo Trader</label>
                      <input 
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Endereço de E-mail</label>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold font-semibold">Minibiografia</label>
                    <textarea 
                      value={bio}
                      rows={3}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-[#e0e3e5] focus:border-primary outline-none transition-all resize-none"
                      placeholder="Conte um pouco sobre sua atuação profissional e interesses em ativos"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="bg-primary-container text-black font-extrabold px-6 py-2.5 rounded-xl hover:scale-102 transition-all text-xs font-mono uppercase shadow-[0_0_15px_rgba(0,224,255,0.25)] cursor-pointer"
                      id="settings-save-profile-btn"
                    >
                      Salvar Informações
                    </button>
                  </div>
                </form>
              </section>

              {/* Section: Preferred Customization */}
              <section className="bg-[#1d2022] rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>palette</span>
                  <h3 className="font-bold font-display text-white text-sm uppercase tracking-wider">Aparência do Tema</h3>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold block mb-3">Preservar visual Aetheric</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark', label: 'Dark Mode', icon: 'dark_mode' },
                        { id: 'light', label: 'Light Mode', icon: 'light_mode' },
                        { id: 'system', label: 'Automático', icon: 'brightness_auto' }
                      ].map((t) => {
                        const isSelected = settings.theme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => onUpdateSettings({ theme: t.id as any })}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                              isSelected 
                                ? 'border-primary bg-primary/5 text-primary shadow-[0_0_12px_rgba(0,224,255,0.1)]' 
                                : 'border-white/5 bg-[#101415]/50 text-on-surface-variant hover:border-white/15'
                            }`}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-xl">{t.icon}</span>
                            <span className="text-[9px] font-mono uppercase font-bold">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* Toggles switches for transactional updates */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold block mb-3">Notificações por E-mail</span>
                    
                    {/* 1 */}
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div className="max-w-[80%]">
                        <p className="text-xs font-bold text-white font-display">Alertas de Ativos</p>
                        <p className="text-[11px] text-[#bac9cd]/50 leading-relaxed">Alertar sobre novos lançamentos ou descontos de apresentações e slides.</p>
                      </div>
                      <button 
                        onClick={toggleMarketing}
                        className={`w-11 h-6 rounded-full relative transition-all duration-300 border cursor-pointer ${
                          settings.marketingAlerts ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/15'
                        }`}
                        type="button"
                        title="Marketing toggle"
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                          settings.marketingAlerts ? 'right-0.5 bg-primary shadow-[0_0_8px_rgba(0,224,255,0.8)]' : 'left-0.5 bg-on-surface-variant'
                        }`} />
                      </button>
                    </div>

                    {/* 2 */}
                    <div className="flex items-center justify-between py-2">
                      <div className="max-w-[80%]">
                        <p className="text-xs font-bold text-white font-display">Atualizações de Cobranças</p>
                        <p className="text-[11px] text-[#bac9cd]/50 leading-relaxed">Enviar faturas de aquisições e alertas de créditos Pix da carteira.</p>
                      </div>
                      <button 
                        onClick={toggleTransactions}
                        className={`w-11 h-6 rounded-full relative transition-all duration-300 border cursor-pointer ${
                          settings.transactionsAlerts ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/15'
                        }`}
                        type="button"
                        title="Transaction toggle"
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
                          settings.transactionsAlerts ? 'right-0.5 bg-primary shadow-[0_0_8px_rgba(0,224,255,0.8)]' : 'left-0.5 bg-on-surface-variant'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: SECURITY & USER AUTHENTICATION OPTIONS */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in text-white">
              
              {/* 1. Alterar Senha de Acesso */}
              <section className="bg-[#1d2022] rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>lock_reset</span>
                  <h3 className="font-bold font-display text-white text-sm uppercase tracking-wider">Alterar Senha de Segurança</h3>
                </div>
                
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Senha Atual</label>
                      <input 
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary outline-none transition-all font-mono"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Nova Senha</label>
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary outline-none transition-all font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Confirmar Nova Senha</label>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-black font-extrabold px-5 py-2 rounded-xl transition-all text-xs font-mono uppercase cursor-pointer"
                    >
                      Atualizar Senha
                    </button>
                  </div>
                </form>
              </section>

              {/* 3. PIN de Segurança da Carteira */}
              <section className="bg-[#1d2022] rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>shield_person</span>
                    <h3 className="font-bold font-display text-white text-sm uppercase tracking-wider">PIN da Carteira (Autorizar Saques Pix)</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-[#101415]/60 border border-white/10 rounded-xl px-3 py-1 text-xs">
                    <span className="font-mono text-primary font-bold">PIN: {revealPin ? walletPin : '••••'}</span>
                    <button
                      type="button"
                      onClick={() => setRevealPin(!revealPin)}
                      className="text-primary hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5"
                      title={revealPin ? 'Ocultar PIN' : 'Visualizar PIN'}
                    >
                      <span className="material-symbols-outlined text-[15px] select-none">
                        {revealPin ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <p className="text-[11px] text-[#bac9cd]/50 leading-relaxed font-mono">
                    O PIN de segurança funciona como uma barreira extra contra transferências não autorizadas. Toda transação de resgate de saldo acumulado nas vendas Speedesk Pix precisará do informe deste código numérico de 4 dígitos.
                  </p>

                  {!showPinInput ? (
                    <button 
                      onClick={() => setShowPinInput(true)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-4 py-2 rounded-xl transition-all text-xs font-mono uppercase cursor-pointer"
                    >
                      Cadastrar ou Alterar Safe PIN
                    </button>
                  ) : (
                    <form onSubmit={handleUpdateWalletPin} className="bg-[#101415]/50 border border-white/10 p-4 rounded-xl space-y-3 animate-fade-in max-w-sm">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Novo PIN (4 dígitos numéricos)</label>
                        <input 
                          type="text"
                          maxLength={4}
                          required
                          value={tempPin}
                          onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ex: 5821"
                          className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-primary outline-none transition-all font-mono tracking-widest text-center text-lg w-32"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 pt-1">
                        <button 
                          type="submit"
                          className="bg-primary text-black font-extrabold px-4 py-1.5 rounded-lg text-xs font-mono uppercase cursor-pointer"
                        >
                          Salvar PIN
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setShowPinInput(false); setTempPin(''); }}
                          className="text-[#bac9cd]/50 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono uppercase"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>

              {/* 4. Sessões e Dispositivos Conectados */}
              <section className="bg-[#1d2022]/40 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-white/5 bg-[#101415]/40 flex justify-between items-center">
                  <h4 className="text-[10px] font-mono text-white tracking-wider font-bold uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm select-none">devices</span>
                    Dispositivos & Sessões Conectadas
                  </h4>
                  <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[#bac9cd]/40">POLÍTICA ATIVA</span>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    {activeSessions.length === 0 ? (
                      <p className="text-[11px] text-on-surface-variant text-center py-4">Nenhuma outra sessão ativa encontrada.</p>
                    ) : (
                      activeSessions.map((session) => (
                        <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#101415]/30 gap-2.5">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg text-[#bac9cd]/60 select-none">
                              {session.device.includes('iPhone') || session.device.includes('Android') ? 'smartphone' : 'laptop_mac'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white block leading-none">{session.device}</span>
                                {session.current && (
                                  <span className="text-[8px] font-mono bg-primary/25 text-primary border border-primary/30 uppercase px-1.5 py-0.2 rounded">Este dispositivo</span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-[#bac9cd]/40 tracking-wider block mt-1">IP: {session.ip} • {session.date}</span>
                            </div>
                          </div>
                          
                          {!session.current && (
                            <button 
                              onClick={() => handleTerminateSession(session.id)}
                              className="text-[9px] font-mono text-red-400 hover:text-red-300 font-bold border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 px-3 py-1 rounded-lg uppercase cursor-pointer"
                            >
                              Encerrar Sessão
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 3: SUBSCRIPTION & PLANS (O caminho de assinatura do plano solicitado!) */}
          {activeTab === 'plan' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Premium Plan Banner Widget */}
              <section className="bg-gradient-to-br from-[#1b2b35] via-[#101415] to-[#121617] rounded-2xl border border-primary/20 p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 pointer-events-none">
                  <span className="material-symbols-outlined text-7xl text-primary/10 select-none scale-110 group-hover:rotate-6 transition-transform duration-500">workspace_premium</span>
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/25 text-primary border border-primary/30 text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest animate-pulse">
                      STATUS: ATIVO
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant font-bold">Próximo faturamento: 03/07/2026</span>
                  </div>

                  <h3 className="text-xl font-black font-display text-white uppercase tracking-tight flex items-center gap-2">
                    Speedesk {currentTier}
                    <span className="text-xs text-primary font-mono tracking-normal capitalize font-semibold">
                      ({currentTier === 'PRO' ? 'Premium' : 'Básico / Gratuito'})
                    </span>
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-lg mt-1 pr-6">
                    {currentTier === 'PRO' 
                      ? 'Você possui acesso completo com taxas de vendas reduzidas para 5%, selo de verificado e prioridade de suporte.'
                      : 'Você está no plano de testes gratuito. Desbloqueie todas as vantagens de taxas reduzidas para 5%, selo de verificado e prioridade de suporte no painel abaixo.'}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#101415]/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider block">Modalidade de Pagamento</span>
                        <span className="text-xs font-bold text-white mt-1 block">
                          {currentTier === 'PRO' ? 'PIX Recorrente Instantâneo' : 'Isento'}
                        </span>
                      </div>
                      {currentTier === 'PRO' && (
                        <span className="text-[10px] font-mono text-primary font-semibold mt-2 block hover:underline cursor-pointer">Alterar Chave Cadastrada &gt;</span>
                      )}
                    </div>

                    <div className="bg-[#101415]/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider block">Emissão de Cobrança</span>
                        <span className="text-xs font-bold text-white mt-1 block">
                          {currentTier === 'PRO' ? 'R$ 29,90' : 'R$ 0,00'} / mês
                        </span>
                      </div>
                      {currentTier === 'PRO' && (
                        <button 
                          onClick={handleCancelSubscription}
                          className="text-[10px] font-mono text-red-400 font-semibold mt-2 text-left hover:underline block cursor-pointer bg-transparent border-none"
                        >
                          Cancelar Assinatura
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* TIER PLANS SELECTION COMPARISON GRID */}
              <section className="space-y-4">
                <h4 className="text-xs font-bold font-display text-white uppercase tracking-widest">Selecione o plano ideal para suas atividades</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plan Option 1: BÁSICO (FREE) */}
                  <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-72 relative ${
                    currentTier === 'Básico' 
                      ? 'bg-white/5 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                      : 'bg-[#191c1e]/40 border-white/5 hover:border-white/15'
                  }`}>
                    {currentTier === 'Básico' && (
                      <span className="absolute -top-2.5 right-4 bg-white/10 text-white font-black font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/20">Seu plano atual</span>
                    )}
                    
                    <div>
                      <div className="flex items-center gap-1.5 text-white font-mono uppercase tracking-widest font-black text-sm mb-1.5">
                        <span className="material-symbols-outlined text-sm text-[#bac9cd]/60">cancel_schedule_send</span>
                        Speedesk Básico
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black font-display text-white">Grátis</span>
                        <span className="text-[10px] font-mono text-on-surface-variant lowercase">/sempre</span>
                      </div>
                      
                      <ul className="mt-4 space-y-2 text-[11px] text-[#bac9cd]/80 leading-snug">
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-red-400 font-bold">close</span>
                          Sem taxas reduzidas (Taxa de 17%)
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-red-400 font-bold">close</span>
                          Sem selo de verificado
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-red-400 font-bold">close</span>
                          Sem prioridade de suporte
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => handleUpgradePlan('Básico')}
                      disabled={currentTier === 'Básico' || isProcessingUpgrade}
                      className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        currentTier === 'Básico'
                          ? 'border border-white/10 text-[#bac9cd]/60 bg-white/5 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:scale-101 shadow-md'
                      }`}
                    >
                      {currentTier === 'Básico' ? 'Plano Ativo' : 'Mudar para Plano Básico'}
                    </button>
                  </div>

                  {/* Plan Option 2: PRO (R$ 29,90) */}
                  <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-72 relative ${
                    currentTier === 'PRO' 
                      ? 'bg-primary/5 border-primary shadow-[0_0_15px_rgba(0,188,248,0.1)]' 
                      : 'bg-[#191c1e]/40 border-white/5 hover:border-white/15'
                  }`}>
                    {currentTier === 'PRO' && (
                      <span className="absolute -top-2.5 right-4 bg-primary text-black font-black font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border border-primary">Seu plano atual</span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 text-white font-mono uppercase tracking-widest font-black text-sm mb-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">workspace_premium</span>
                        Speedesk PRO
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black font-display text-white">R$ 29,90</span>
                        <span className="text-[10px] font-mono text-on-surface-variant lowercase">/mês</span>
                      </div>

                      <ul className="mt-4 space-y-2 text-[11px] text-[#bac9cd]/80 leading-snug">
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>
                          Taxas de venda reduzidas para 5%
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>
                          Selo Verificado de Criador no perfil
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary font-bold">check</span>
                          Prioridade de suporte
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => handleUpgradePlan('PRO')}
                      disabled={currentTier === 'PRO' || isProcessingUpgrade}
                      className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        currentTier === 'PRO'
                          ? 'border border-primary/20 text-primary bg-primary/10 cursor-not-allowed'
                          : isProcessingUpgrade
                            ? 'bg-[#101415] border border-white/5 text-on-surface-variant animate-pulse'
                            : 'bg-primary text-black hover:scale-101 hover:shadow-[0_0_12px_rgba(0,188,248,0.4)]'
                      }`}
                    >
                      {isProcessingUpgrade ? 'Processando Fundo...' : currentTier === 'Básico' ? 'Fazer Upgrade PRO (R$ 29,90)' : 'Plano Ativo'}
                    </button>
                  </div>
                </div>
              </section>

              {/* ACCOUNT INVOICES HISTORY HISTORY MODULE */}
              <section className="bg-[#1d2022]/40 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-white/5 bg-[#101415]/40 flex justify-between items-center">
                  <h4 className="text-[10px] font-mono text-white tracking-wider font-bold uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm select-none">receipt_long</span>
                    Histórico de Notas e Faturamento Pix
                  </h4>
                  <span className="text-[8px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[#bac9cd]/40">AUDITADO</span>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    {invoiceHistory.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#101415]/30">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-sm text-[#bac9cd]/50">receipt</span>
                          <div>
                            <span className="text-xs font-bold text-white block leading-none">{invoice.id}</span>
                            <span className="text-[9px] font-mono text-[#bac9cd]/40 tracking-wider block mt-1">{invoice.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-white">{invoice.total}</span>
                          <span className="text-[8px] font-mono font-bold bg-green-500/15 text-green-400 border border-green-500/20 uppercase px-2 py-0.5 rounded">
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
