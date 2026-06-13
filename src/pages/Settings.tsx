import React, { useState } from 'react';
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

  // Estados locais sincronizados
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [loading, setLoading] = useState(false);

  // Lógica do Item 3: Assinatura PRO Real via Stripe
  const handleProUpgrade = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242';
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session?.user.id, 
          priceId: 'price_1TeDXZQ3BpaRaOV8DsM4XODS', // Seu ID do Plano PRO
          mode: 'subscription' 
        })
      });

      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Nao foi possivel conectar ao gateway da Stripe.");
    } finally {
      setLoading(false);
    }
  };

  // Persistência Real de Perfil no Supabase
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessao invalida.");

      // Atualiza na tabela public.profiles
      const { error } = await supabase
        .from('profiles')
        .update({ username, bio })
        .eq('id', user.id);

      if (error) throw error;

      onUpdateProfile({ username, bio });
      alert("Dados sincronizados com o banco de dados.");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <header className="mb-10">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Configurações</h1>
        <p className="text-xs text-on-surface-variant font-medium">Controle de identidade e parametrização do ecossistema.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navegação Desktop */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24">
          <nav className="flex flex-col gap-1 bg-[#191c1e] border border-white/5 p-2 rounded-2xl">
            {['general', 'security', 'plan'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ tab })}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-mono font-bold uppercase transition-all ${
                  activeTab === tab ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {tab === 'general' ? 'Geral & Perfil' : tab === 'security' ? 'Segurança' : 'Assinatura PRO'}
              </button>
            ))}
          </nav>
        </aside>

        <main className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: GERAL & PERFIL */}
          {activeTab === 'general' && (
            <section className="bg-[#1d2022] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Dados Cadastrais</h3>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Email (Fixo)</label>
                    <input type="email" value={email} disabled className="w-full bg-[#101415] border border-white/5 rounded-2xl px-4 py-3 text-xs text-on-surface-variant opacity-50 outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Biografia do Trader</label>
                  <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:border-primary outline-none resize-none" />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="bg-primary text-black font-black px-8 py-3 rounded-xl uppercase text-xs shadow-lg hover:scale-102 transition-all">
                    {loading ? 'Gravando no Banco...' : 'Atualizar Perfil'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB 3: ASSINATURA PRO REAL */}
          {activeTab === 'plan' && (
            <div className="space-y-6 animate-fade-in">
              <section className="bg-gradient-to-br from-[#1b2b35] to-[#101415] border border-primary/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <span className="material-symbols-outlined text-7xl text-primary">workspace_premium</span>
                </div>

                <div className="relative z-10">
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[2px] mb-4 inline-block">Plano Pro Evolution</span>
                  <h3 className="text-2xl font-black text-white mb-2">Desbloqueie o potencial maximo.</h3>
                  <p className="text-xs text-on-surface-variant max-w-lg mb-8 leading-relaxed">
                    Obtenha selo de criador verificado, taxas reduzidas para 5% em suas vendas de ativos e suporte prioritario 24/7.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                        <p className="text-[10px] text-on-surface-variant font-mono uppercase mb-2">Investimento</p>
                        <p className="text-xl font-bold text-white">R$ 29,90 <span className="text-[10px] opacity-50">/ mes</span></p>
                     </div>
                     <button 
                        onClick={handleProUpgrade}
                        disabled={loading}
                        className="bg-primary text-black font-black rounded-2xl hover:shadow-[0_0_20px_#00e0ff] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase text-xs"
                      >
                        {loading ? 'Inicializando...' : 'Ativar com Stripe'}
                        <span className="material-symbols-outlined text-sm">rocket_launch</span>
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