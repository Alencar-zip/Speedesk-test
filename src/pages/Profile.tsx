import React, { useState } from 'react';
import { UserProfile, Product } from '../types';
import { Link } from 'react-router-dom';

interface ProfileProps {
  profile: UserProfile;
  balance: number;
  libraryIds: number[];
  products: Product[];
  onLogout: () => void;
}

export default function Profile({ profile, balance, libraryIds, products, onLogout }: ProfileProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Address simulation for a future cyber wallet matching assets security checks
  const mockWalletAddress = "0xae82ef10c...3b4a2d81";

  const handleCopyAddress = () => {
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const ownedProducts = products.filter(p => libraryIds.includes(p.id));

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card info */}
        <div className="lg:col-span-4 bg-[#1d2022] border border-white/10 p-6 rounded-3xl text-center flex flex-col items-center justify-between shadow-lg">
          <div className="space-y-4 w-full">
            {/* Holographic Avatar Framer */}
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-[#c0c1ff] rounded-full blur-sm opacity-60 animate-pulse" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary bg-surface-dim flex items-center justify-center">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#191c1e] text-[#8b9293]">
                    <svg className="w-16 h-16 text-[#8b9293]/75" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* General Description info */}
            <div>
              <h2 className="text-xl font-bold font-display text-white">{profile.username}</h2>
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block mt-1">
                {profile.verified ? '✓ Trader Verificado' : 'Membro Premium'}
              </span>
            </div>

            {/* Mock contract address indicator for Speedesk Secure Keys */}
            <div className="bg-[#101415] rounded-xl p-3 border border-white/5 space-y-1 text-left">
              <span className="text-[8px] font-mono text-on-surface-variant/40 uppercase block">Chave Criptográfica Ledger</span>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-primary-container truncate">{mockWalletAddress}</span>
                <button 
                  onClick={handleCopyAddress} 
                  className="text-on-surface-variant hover:text-primary cursor-pointer ml-1"
                  title="Copiar Ledger Chave"
                >
                  <span className="material-symbols-outlined text-xs">{copiedAddress ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions panel */}
          <div className="w-full space-y-2 mt-6">
            <Link
              to="/settings"
              className="w-full bg-[#191c1e] hover:bg-[#272a2c] text-white border border-white/10 text-xs font-mono font-bold py-2.5 rounded-xl transition-all uppercase block text-center"
            >
              Editar Perfil
            </Link>

            <button
              onClick={onLogout}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono font-bold py-2.5 rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sair da Sessão
            </button>
          </div>
        </div>

        {/* Right Info and Statistics panels */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bio and metadata recap */}
          <div className="bg-[#1d2022] rounded-2xl p-6 border border-white/5 space-y-4">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider block font-bold">Resumo Profissional</span>
            <p className="text-sm text-[#e0e3e5] leading-relaxed font-body">
              {profile.bio || "Nenhuma biografia informada ainda. Vá para as Configurações para atualizar seus dados e completar seu pseudônimo na rede."}
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-mono">
              <div>
                <span className="text-on-surface-variant/60 block mb-0.5">E-mail de Contato</span>
                <span className="text-white font-semibold">{profile.email}</span>
              </div>
              <div>
                <span className="text-on-surface-variant/60 block mb-0.5">Membro desde</span>
                <span className="text-primary font-semibold">{profile.memberSince}</span>
              </div>
            </div>
          </div>

          {/* Bento Grid: Stats records indicators */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Stat 1 */}
            <div className="bg-[#1d2022]/40 border border-white/5 p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-primary text-xl mb-1 select-none" style={{fontVariationSettings: "'FILL' 1"}}>inventory</span>
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider block">Portfólio Ativos</span>
              <h4 className="text-2xl font-bold text-white font-mono mt-1">{ownedProducts.length}</h4>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#1d2022]/40 border border-white/5 p-4 rounded-xl text-center">
              <span className="material-symbols-outlined text-[#ffb4ab] text-xl mb-1 select-none" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider block">Avaliações Feitas</span>
              <h4 className="text-2xl font-bold text-white font-mono mt-1">{ownedProducts.length > 0 ? '4' : '0'}</h4>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#1d2022]/40 border border-white/5 p-4 rounded-xl text-center col-span-2 md:col-span-1">
              <span className="material-symbols-outlined text-primary-container text-xl mb-1 select-none" style={{fontVariationSettings: "'FILL' 1"}}>savings</span>
              <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-wider block">Saldo na Carteira</span>
              <h4 className="text-sm font-bold text-primary-container font-mono mt-2 truncate">
                R$ {balance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </h4>
            </div>
          </div>

          {/* Quick lists of purchased files for immediate actions */}
          <div className="bg-[#1d2022]/40 border border-white/5 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold font-display text-white text-sm uppercase tracking-wider">Acesso Rápido</h3>
              <Link to="/library" className="text-xs text-primary font-bold hover:underline font-mono uppercase tracking-wider">Ver Biblioteca</Link>
            </div>

            {ownedProducts.length > 0 ? (
              <div className="space-y-3">
                {ownedProducts.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-[#101415]/70 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-8 rounded bg-surface-dim overflow-hidden shrink-0 border border-white/10">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[9px] font-mono text-[#bac9cd]/50 uppercase">{item.format} • {item.specs.size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Iniciando download de "${item.title}${item.specs.fileFormat || '.zip'}"...`)}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer"
                    >
                      BAIXAR
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant font-body leading-relaxed py-3">
                Você ainda não comprou apresentações. Navegue pelas coleções do Marketplace para adicionar itens com segurança.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
