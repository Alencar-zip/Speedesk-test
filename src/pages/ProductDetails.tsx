import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface ProductDetailsProps {
  products: Product[];
  libraryIds: (number | string)[]; // Ajustado para aceitar UUID
  favoriteIds: (number | string)[]; // Ajustado para aceitar UUID
  onToggleFavorite: (id: number | string) => void;
}

export default function ProductDetails({ products, libraryIds, favoriteIds, onToggleFavorite }: ProductDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // BUSCA CORRIGIDA: Compara como String para suportar tanto Number quanto UUID
  const product = products.find((p) => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-error mb-4">warning</span>
        <h2 className="text-xl font-bold font-display text-white mb-2">Ativo não encontrado</h2>
        <p className="text-xs text-on-surface-variant mb-6">O produto solicitado não foi identificado no banco de dados.</p>
        <Link to="/" className="bg-primary text-black font-bold px-6 py-2 rounded-xl text-xs font-mono tracking-wider hover:scale-105 transition-all">
          Voltar ao Marketplace
        </Link>
      </div>
    );
  }

  // Verificação de posse e favorito usando String para segurança
  const isPurchased = libraryIds.some(libId => String(libId) === String(product.id));
  const isFavorite = favoriteIds.some(favId => String(favId) === String(product.id));

  const simulateDownload = () => {
    alert(`Preparando download de "${product.title}${product.specs.fileFormat || '.zip'}"...\nSeu download de ${product.specs.size} comecará em instantes.`);
  };

  return (
    <div className="pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <nav className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-primary transition-colors">Marketplace</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">{product.category}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold truncate max-w-[150px] sm:max-w-none">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1d2022]/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={product.img} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuCDy5mT0iUelOWZn1HgzqtPiCEi3ZzirCZ8RKyHSisN8-qRxmj7fNdJ9YgLgPMLZBWUVjJfKI1q5sfaHU_iwnSMpCvKHLIrc8Q1P9XNl7WHONpqgqDbrRAPZ8pap4OBq-AHVZgEM03Aez2nozY7XD6ihBX_SykdEYJFSM3l-FFkmDKFDqYcewsPSb3kLkS6iQ5EOeh85Z8KM8GM_4V52DirOoTMQ5nUC7kpFLt7u0_-DnFXcQNZLo-HxUjFNm3f2s_K7s3Fl9l-xQ";
                }}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-black/80 border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-primary uppercase">
                {product.format}
              </div>
            </div>
            <div className="bg-black/60 p-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Galeria de Visualização</span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          <div className="bg-[#1d2022] rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider border-b border-white/5 pb-2">Especificações Técnicas</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Resolução</span>
                <span className="font-bold text-white">{product.specs?.resolution || '1920x1080'}</span>
              </div>
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Software</span>
                <span className="font-bold text-white truncate block">{product.specs?.software || 'Multi'}</span>
              </div>
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Tamanho</span>
                <span className="font-bold text-primary">{product.specs?.size || 'N/A'}</span>
              </div>
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Suporte</span>
                <span className="font-bold text-white">{product.specs?.updates || 'Sim'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1d2022]/50 border border-[#3b494c]/20 p-6 rounded-3xl shadow-xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Estúdio: <span className="text-white">{product.creator}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#272a2c] px-2.5 py-0.5 rounded text-xs text-[#ffb4ab]">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span className="font-mono font-bold">{product.rating || '5.0'}</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black font-display text-white leading-tight mb-3">{product.title}</h1>

              <div className="flex gap-4 mb-4 text-[10px] font-mono text-on-surface-variant">
                <span className="bg-[#101415]/50 px-2 py-1 rounded">Visitas: {product.views || 0}</span>
                <span className="bg-[#101415]/50 px-2 py-1 rounded">Vendas: {product.downloads || 0}</span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">{product.description}</p>

              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-mono text-primary uppercase tracking-wider font-bold">Incluso no pacote:</p>
                {product.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#e0e3e5]">
                    <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#101415]/80 p-4 rounded-2xl border border-white/5">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-mono text-on-surface-variant uppercase">Valor do Ativo</span>
                <div className="text-right">
                  <span className="text-primary-container text-2xl font-black font-mono">R$ {Number(product.price).toFixed(2)}</span>
                </div>
              </div>

              {isPurchased ? (
                <button onClick={simulateDownload} className="w-full bg-primary-container text-black font-extrabold py-3 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">download</span> BAIXAR AGORA
                </button>
              ) : (
                <div className="grid grid-cols-12 gap-2">
                  <button onClick={() => navigate(`/checkout/${product.id}`)} className="col-span-10 bg-primary-container text-black font-extrabold py-3 rounded-xl shadow-lg text-sm">ADQUIRIR ATIVO</button>
                  <button onClick={() => onToggleFavorite(product.id)} className={`col-span-2 rounded-xl flex items-center justify-center border ${isFavorite ? 'border-primary text-primary' : 'border-white/10 text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[18px]">{isFavorite ? 'favorite' : 'favorite_border'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}