import React, { useState } from 'react';
import { UserProfile, Product } from '../types';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  profile: UserProfile;
  balance: number;
  libraryIds: (number | string)[];
  products: Product[];
  onLogout: () => void;
}

export default function Profile({ profile, balance, libraryIds, products, onLogout }: ProfileProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const mockWalletAddress = "0xae82ef10c...3b4a2d81";

  const handleCopyAddress = () => {
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // FILTRO CORRIGIDO: Agora aceita UUID do banco e Number dos mocks
  const ownedProducts = products.filter(p => 
    libraryIds.some(id => String(id) === String(p.id))
  );

  // Lógica de download real para o acesso rápido
  const handleQuickDownload = async (product: Product) => {
    try {
      const filePath = product.file_path;
      if (!filePath) return alert("Arquivo fonte nao localizado.");

      const { data, error } = await supabase.storage
        .from('assets')
        .createSignedUrl(filePath, 60);

      if (error) throw error;
      window.location.assign(data.signedUrl);
    } catch (e) {
      alert("Erro ao processar download seguro.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Card Lateral (Identidade) */}
        <div className="lg:col-span-4 bg-[#1d2022] border border-white/10 p-6 rounded-3xl text-center flex flex-col items-center justify-between shadow-lg">
          <div className="space-y-4 w-full">
            <div className="relative w-28 h-28 mx-auto">
              <div className={`absolute inset-0 rounded-full blur-sm opacity-60 ${profile.role !== 'User' ? 'bg-gradient-to-tr from-primary to-[#00e0ff] animate-pulse' : 'bg-white/10'}`} />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary bg-surface-dim">
                <img src={profile.avatar || 'https://sua-padrao.png'} alt={profile.username} className="w-full h-full object-cover" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-xl font-bold font-display text-white">{profile.username}</h2>
                {profile.role !== 'User' && (
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block mt-1">
                {profile.role === 'Admin' ? 'Administrador Speedesk' : profile.role === 'User' ? 'Trader Standard' : 'Trader Premium'}
              </span>
            </div>

            <div className="bg-[#101415] rounded-xl p-3 border border-white/5 space-y-1 text-left">
              <span className="text-[8px] font-mono text-on-surface-variant/40 uppercase block">Chave Criptografica Speedesk</span>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-primary-container truncate">{mockWalletAddress}</span>
                <button onClick={handleCopyAddress} className="text-on-surface-variant hover:text-primary cursor-pointer">
                  <span className="material-symbols-outlined text-xs">{copiedAddress ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2 mt-6">
            <Link to="/settings" className="w-full bg-[#191c1e] hover:bg-[#272a2c] text-white border border-white/10 text-xs font-mono font-bold py-2.5 rounded-xl uppercase block text-center transition-all">Editar Perfil</Link>
            <button onClick={onLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono font-bold py-2.5 rounded-xl transition-all uppercase flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">logout</span> Sair
            </button>
          </div>
        </div>

        {/* Painel Principal (Stats) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#1d2022] rounded-2xl p-6 border border-white/5 space-y-4">
            <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest">Resumo Profissional</span>
            <p className="text-sm text-[#e0e3e5] leading-relaxed">{profile.bio || "Entusiasta de ativos digitais."}</p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-mono">
              <div><span className="text-on-surface-variant/60 block mb-0.5">Email</span><span className="text-white">{profile.email}</span></div>
              <div><span className="text-on-surface-variant/60 block mb-0.5">Ativo desde</span><span className="text-primary">{profile.memberSince}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1d2022]/40 border border-white/5 p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-primary text-xl mb-1">inventory</span>
              <span className="text-[9px] font-mono text-on-surface-variant uppercase block">Ativos</span>
              <h4 className="text-2xl font-bold text-white font-mono mt-1">{ownedProducts.length}</h4>
            </div>
            <div className="bg-[#1d2022]/40 border border-white/5 p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-primary-container text-xl mb-1">savings</span>
              <span className="text-[9px] font-mono text-on-surface-variant uppercase block">Saldo</span>
              <h4 className="text-sm font-bold text-primary-container font-mono mt-2 truncate">R$ {balance.toLocaleString('pt-BR')}</h4>
            </div>
            <div className="bg-[#1d2022]/40 border border-white/5 p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-green-400 text-xl mb-1">workspace_premium</span>
              <span className="text-[9px] font-mono text-on-surface-variant uppercase block">Plano</span>
              <h4 className="text-xs font-bold text-white font-mono mt-2 uppercase">{profile.role === 'User' ? 'Basic' : 'PRO'}</h4>
            </div>
          </div>

          {/* Lista de Acesso Rápido */}
          <div className="bg-[#1d2022]/40 border border-white/5 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Downloads Recentes</h3>
              <Link to="/library" className="text-[10px] text-primary font-bold hover:underline font-mono uppercase">Ver Tudo</Link>
            </div>

            {ownedProducts.length > 0 ? (
              <div className="space-y-3">
                {ownedProducts.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-[#101415]/70 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 truncate">
                      <img src={item.img} alt="" className="w-10 h-8 rounded object-cover border border-white/10" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[9px] font-mono text-primary uppercase font-bold">{item.format}</span>
                      </div>
                    </div>
                    <button onClick={() => handleQuickDownload(item)} className="bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all">BAIXAR</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant py-3">Nenhum ativo adquirido ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}