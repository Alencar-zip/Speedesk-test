import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile, AppSettings, Transaction } from '../types';
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
  const [realInvoices, setRealInvoices] = useState<Transaction[]>([]);

  // --- ESTADOS REAIS ---
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [walletPin, setWalletPin] = useState('****');
  const [tempPin, setTempPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [revealPin, setRevealPin] = useState(false);

  // Carregar dados extras do banco (PIN e Recibos)
  useEffect(() => {
    const loadSecureData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Busca PIN na tabela profiles
      const { data: prof } = await supabase.from('profiles').select('wallet_pin').eq('id', user.id).single();
      if (prof?.wallet_pin) setWalletPin(prof.wallet_pin);

      // 2. Busca Transações do tipo Assinatura/PRO para os Recibos
      const { data: txs } = await supabase.from('transactions')
        .select('*')
        .eq('buyer_id', user.id)
        .ilike('source', '%PRO%'); // Filtra o que tem "PRO" no nome
      if (txs) setRealInvoices(txs as Transaction[]);
    };
    loadSecureData();
  }, []);

  const avatarPresets = [
    { name: 'Aether', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' },
    { name: 'Cyan', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150' },
    { name: 'Bio', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=150' },
    { name: 'Red', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150' }
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').update({ 
        username, bio, avatar_url: avatar 
      }).eq('id', user?.id);

      if (error) throw error;
      onUpdateProfile({ username, bio, avatar });
      alert('Sincronizacao de identidade concluida.');
    } catch (err: any) {
      alert('Falha na persistencia: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProUpgrade = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242';
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user.id, priceId: 'price_1TeDXZQ3BpaRaOV8DsM4XODS', mode: 'subscription' })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Gateway de faturamento offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWalletPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPin.length !== 4) return alert("O PIN deve ter 4 digitos.");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').update({ wallet_pin: tempPin }).eq('id', user?.id);
      if (error) throw error;
      setWalletPin(tempPin);
      setShowPinInput(false);
      alert('PIN de seguranca atualizado no ledger.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="mb-10">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter">Configurações</h1>
        <p className="text-xs text-on-surface-variant font-medium">Nucleo de gestao de identidade e faturamento.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <nav className="flex flex-col gap-1 bg-[#191c1e] border border-white/5 p-2 rounded-2xl">
            {['general', 'security', 'plan'].map((tab) => (
              <button key={tab} onClick={() => setSearchParams({ tab })} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-mono font-bold uppercase transition-all ${activeTab === tab ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'}`}>
                {tab === 'general' ? 'Perfil' : tab === 'security' ? 'Proteção' : 'Assinatura'}
              </button>
            ))}
          </nav>
        </aside>

        <main className="lg:col-span-9 space-y-8">
          {activeTab === 'general' && (
            <section className="bg-[#1d2022] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Identidade Visual</h3>
              </div>
              <form onSubmit={handleProfileSubmit} className="p-8 space-y-8">
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_15px_rgba(0,218,248,0.3)]">
                        <img src={avatar || "https://sua-padrao.png"} className="w-full h-full object-cover" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        {avatarPresets.map(p => (
                          <button key={p.name} type="button" onClick={() => setAvatar(p.url)} className={`h-12 rounded-lg border ${avatar === p.url ? 'border-primary ring-1 ring-primary' : 'border-white/5 opacity-50'}`}>
                            <img src={p.url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="bg-[#101415] border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary" placeholder="Username" />
                   <input type="email" value={profile.email} disabled className="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-on-surface-variant opacity-40 cursor-not-allowed" />
                </div>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-primary resize-none" placeholder="Biografia tecnica..." />
                <div className="flex justify-end"><button type="submit" disabled={loading} className="bg-primary text-black font-black px-10 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase">{loading ? 'Gravando...' : 'Atualizar Dados'}</button></div>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in text-white">
              <section className="bg-[#1d2022] rounded-3xl border border-white/10 p-8 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-primary">key</span> PIN de Saque</h3>
                  <div className="bg-[#101415] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                     <span className="text-xs font-mono text-primary font-bold">{revealPin ? walletPin : '****'}</span>
                     <button onClick={() => setRevealPin(!revealPin)} className="material-symbols-outlined text-xs text-primary">{revealPin ? 'visibility_off' : 'visibility'}</button>
                  </div>
                </div>
                {!showPinInput ? (
                  <button onClick={() => setShowPinInput(true)} className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-bold uppercase">Mudar PIN da Carteira</button>
                ) : (
                  <form onSubmit={handleUpdateWalletPin} className="flex gap-2 animate-fade-in">
                    <input type="text" maxLength={4} value={tempPin} onChange={e => setTempPin(e.target.value.replace(/\D/g,''))} className="bg-[#101415] border border-primary/40 rounded-xl px-4 py-2 text-sm text-center w-24 outline-none" placeholder="0000" />
                    <button type="submit" className="bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-bold">SALVAR</button>
                  </form>
                )}
              </section>

              <section className="bg-[#1d2022] rounded-3xl border border-white/10 p-8 shadow-2xl">
                 <h3 className="text-xs font-bold uppercase mb-6">Dispositivos Conectados</h3>
                 <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-xs text-white font-bold">{navigator.platform} - {navigator.appName}</p>
                      <span className="text-[9px] font-mono opacity-50">Localizacao aproximada: Salvador, BR • Sessao Ativa</span>
                    </div>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded text-[8px] font-black tracking-widest">ATUAL</span>
                 </div>
              </section>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-6 animate-fade-in">
              <section className="bg-gradient-to-br from-[#1b2b35] via-[#101415] to-[#121617] border border-primary/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 opacity-10 scale-150 rotate-12 transition-all duration-700">
                    <span className="material-symbols-outlined text-8xl text-primary">rocket_launch</span>
                 </div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border tracking-widest ${profile.role !== 'User' ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-primary/10 text-primary border-primary/30'}`}>
                        {profile.role !== 'User' ? 'Premium Ativo' : 'Basic Mode'}
                      </span>
                   </div>
                   <h3 className="text-3xl font-black text-white font-display mb-2 uppercase tracking-tighter">Assinatura Speedesk PRO</h3>
                   <p className="text-xs text-on-surface-variant max-w-lg mb-8 leading-relaxed">Taxas de 5% e selo VIP garantidos em tempo real via rede Stripe.</p>
                   <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="bg-[#101415] p-5 rounded-2xl border border-white/5 flex-1 w-full">
                         <p className="text-[10px] font-mono text-on-surface-variant uppercase mb-1">Cobranca Mensal</p>
                         <p className="text-2xl font-black text-white">R$ 29,90</p>
                      </div>
                      <button onClick={handleProUpgrade} disabled={loading || profile.role !== 'User'} className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black transition-all text-xs uppercase tracking-[2px] ${profile.role !== 'User' ? 'bg-white/5 text-primary border border-primary/30 cursor-not-allowed shadow-inner' : 'bg-primary text-black shadow-[0_0_30px_#00e0ff] hover:scale-105'}`}>
                         {loading ? 'Ligando aos bancos...' : profile.role !== 'User' ? 'ASSINATURA ATIVA' : 'ATIVAR COM STRIPE'}
                      </button>
                   </div>
                 </div>
              </section>

              <section className="bg-[#1d2022] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                 <div className="p-4 border-b border-white/5 bg-white/[0.01] flex justify-between items-center font-mono text-[9px]"><span className="text-white font-bold uppercase tracking-widest">Historico de Recibos</span></div>
                 <div className="p-4 divide-y divide-white/5">
                    {realInvoices.length > 0 ? realInvoices.map(inv => (
                      <div key={inv.id} className="py-3 flex justify-between items-center text-xs">
                         <span className="text-[#bac9cd]/50 font-mono">{inv.id} / {inv.date}</span>
                         <span className="font-bold text-white">R$ {Math.abs(inv.amount).toFixed(2)}</span>
                      </div>
                    )) : <p className="text-[10px] text-on-surface-variant py-4">Nenhum faturamento registrado.</p>}
                 </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}