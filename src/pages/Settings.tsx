import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile, AppSettings } from '../types';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  profile: UserProfile;
  settings: AppSettings;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateSettings: (updated: Partial<AppSettings>) => void;
}

export default function Settings({ profile, settings, onUpdateProfile, onUpdateSettings }: SettingsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DO PERFIL (RECUPERADOS) ---
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar || '');

  // --- ESTADOS DE SEGURANÇA (RECUPERADOS) ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletPin, setWalletPin] = useState('5812');
  const [revealPin, setRevealPin] = useState(false);

  // Artes Predefinidas do Design System Original
  const avatarPresets = [
    { name: 'Neon Purple', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' },
    { name: 'Aether Blue', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150' },
    { name: 'Matrix Green', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=150' },
    { name: 'Futuristic Red', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150' }
  ];

  // 1. AÇÃO REAL: Atualizar Perfil no Supabase
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').update({ 
        username, bio, avatar_url: avatar 
      }).eq('id', user?.id);

      if (error) throw error;
      onUpdateProfile({ username, bio, avatar });
      alert("Configurações sincronizadas na rede Speedesk.");
    } catch (err: any) {
      alert("Falha técnica: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. AÇÃO REAL: Iniciar Assinatura via Stripe (Render)
  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242';
      
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user.id,
          priceId: 'price_1TeDXZQ3BpaRaOV8DsM4XODS', // Seu ID real de Assinatura
          mode: 'subscription'
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert("Erro ao conectar ao servidor de pagamentos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="mb-10">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter">Configurações</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-1">Níveis de acesso, identidade e parametrização do workspace.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* NAVEGAÇÃO DESKTOP */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <nav className="flex flex-col gap-1 bg-[#191c1e] border border-white/5 p-2 rounded-2xl">
            {['general', 'security', 'plan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ tab })}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-mono font-bold uppercase transition-all ${
                  activeTab === tab ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'general' ? 'Identidade' : tab === 'security' ? 'Proteção' : 'Faturamento'}
              </button>
            ))}
          </nav>
        </aside>

        <main className="lg:col-span-9 space-y-8">

          {/* TAB: IDENTIDADE (GERAL) */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fade-in">
              <section className="bg-[#1d2022] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                   <span className="material-symbols-outlined text-primary">account_circle</span>
                   <h3 className="text-xs font-bold text-white uppercase tracking-widest">Editor de Perfil</h3>
                </div>

                <form onSubmit={handleProfileUpdate} className="p-8 space-y-8">
                  {/* Custom Avatar Picker */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-tighter">Avatar Heurístico</span>
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_15px_#00daf8]">
                        <img src={avatar || "https://sua-padrao.png"} className="w-full h-full object-cover" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        {avatarPresets.map(p => (
                          <button key={p.name} type="button" onClick={() => setAvatar(p.url)} className={`h-12 rounded-lg overflow-hidden border ${avatar === p.url ? 'border-primary ring-1 ring-primary' : 'border-white/5'}`}>
                            <img src={p.url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Pseudônimo</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Contato Master (Bloqueado)</label>
                      <input type="email" value={profile.email} disabled className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-on-surface-variant opacity-40 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Bio Profissional</label>
                    <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary resize-none" />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="bg-primary text-black font-black px-10 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xs">
                      {loading ? 'SINCRONIZANDO...' : 'ATUALIZAR IDENTIDADE'}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* TAB: SEGURANÇA (RECUPERADA) */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <section className="bg-[#1d2022] rounded-3xl border border-white/10 p-8 shadow-2xl space-y-8">
                 <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary">security</span> Chave PIN da Carteira
                 </h3>
                 <div className="flex justify-between items-center bg-[#101415]/80 p-5 rounded-2xl border border-white/5">
                   <div>
                     <p className="text-xs text-white font-bold mb-1 tracking-tight">PIN Ativo de Verificação: <span className="font-mono text-primary">{revealPin ? walletPin : '****'}</span></p>
                     <p className="text-[10px] text-on-surface-variant">Necessário para solicitações de saque Pix no Sandbox.</p>
                   </div>
                   <button onClick={() => setRevealPin(!revealPin)} className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-mono uppercase font-black hover:bg-primary hover:text-black">
                     {revealPin ? 'Esconder' : 'Ver PIN'}
                   </button>
                 </div>
              </section>

              <section className="bg-[#1d2022] rounded-3xl border border-white/10 p-8 shadow-2xl">
                 <h3 className="text-white font-bold text-sm uppercase mb-6 flex items-center gap-2"><span className="material-symbols-outlined text-primary">devices</span> Dispositivos</h3>
                 <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                       <div><p className="text-xs text-white font-bold">Vercel Edge Gateway (Production)</p><span className="text-[9px] font-mono opacity-50">Sessão em: {new Date().toLocaleTimeString()} • Salvador, BR</span></div>
                       <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-[8px] font-bold">ATUAL</span>
                    </div>
                 </div>
              </section>
            </div>
          )}

          {/* TAB: FATURAMENTO (PRO PLAN - INTEGRADO STRIPE LIVE) */}
          {activeTab === 'plan' && (
            <div className="space-y-6 animate-fade-in">
              <section className="bg-gradient-to-br from-[#1b2b35] via-[#101415] to-[#121617] rounded-3xl border border-primary/20 p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                    <span className="material-symbols-outlined text-7xl text-primary">rocket_launch</span>
                 </div>

                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <span className="bg-primary/25 text-primary border border-primary/40 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">Core Status: On</span>
                   </div>
                   
                   <h3 className="text-3xl font-black text-white font-display mb-2">Upgrade Profissional PRO</h3>
                   <p className="text-xs text-on-surface-variant max-w-lg mb-8 leading-relaxed italic">Ative as taxas reduzidas (5%) e garanta a insignia VIP no Perfil em tempo real.</p>

                   <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="bg-[#101415] p-5 rounded-2xl border border-white/5 w-full sm:w-auto min-w-[200px]">
                         <p className="text-[9px] font-mono text-on-surface-variant uppercase mb-2">Cobrança Mensal</p>
                         <p className="text-2xl font-black text-white font-display">R$ 29,90 <span className="text-[10px] text-[#00ffcc] tracking-widest font-mono">/ BR</span></p>
                      </div>
                      
                      <button onClick={handleStripeCheckout} disabled={loading} className="w-full sm:w-auto flex-1 bg-primary text-black font-black py-5 rounded-2xl shadow-[0_0_20px_#00daf8] hover:scale-102 transition-all uppercase tracking-[2px] text-xs">
                         {loading ? 'Ligando aos bancos...' : 'Pagar Agora (Cartão / Pix)'}
                      </button>
                   </div>
                 </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}