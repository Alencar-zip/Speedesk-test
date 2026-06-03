import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface ProductDetailsProps {
  products: Product[];
  libraryIds: number[];
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
}

export default function ProductDetails({ products, libraryIds, favoriteIds, onToggleFavorite }: ProductDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Parse ID and find product
  const productId = parseInt(id || '0', 10);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-error mb-4">warning</span>
        <h2 className="text-xl font-bold font-display text-white mb-2">Ativo não encontrado</h2>
        <p className="text-xs text-on-surface-variant mb-6">O produto solicitado pode ter sido descontinuado ou o link está quebrado.</p>
        <Link to="/" className="bg-primary text-black font-bold px-6 py-2 rounded-xl text-xs font-mono tracking-wider hover:scale-105 transition-all">
          Voltar ao Marketplace
        </Link>
      </div>
    );
  }

  const isPurchased = libraryIds.includes(product.id);
  const isFavorite = favoriteIds.includes(product.id);

  const simulateDownload = () => {
    // Elegant system file download mock alert
    alert(`Preparando download de "${product.title}${product.specs.fileFormat || '.zip'}"...\nSeu download de ${product.specs.size} começará em instantes!`);
  };

  return (
    <div className="pb-20 animate-fade-in relative">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Path Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-primary transition-colors">Marketplace</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">{product.category}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold truncate max-w-[150px] sm:max-w-none">{product.title}</span>
      </nav>

      {/* Primary Detail Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Aspect: Display Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1d2022]/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
            
            {/* Main Picture */}
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={product.img} 
                onError={(e) => {
                  // Fallback
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

            {/* Simulated Live Preview Slide Indicator dots */}
            <div className="bg-black/60 p-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">
                Galeria de Visualização
              </span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span className="w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Core Technical Specifications List */}
          <div className="bg-[#1d2022] rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Especificações Técnicas
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Resolução</span>
                <span className="font-bold text-white">{product.specs.resolution}</span>
              </div>
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Software</span>
                <span className="font-bold text-white truncate max-w-full block">{product.specs.software}</span>
              </div>
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Tamanho</span>
                <span className="font-bold text-primary">{product.specs.size}</span>
              </div>
              <div className="bg-[#101415]/75 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[9px] text-[#bac9cd]/50 uppercase block mb-1">Suporte</span>
                <span className="font-bold text-white">{product.specs.updates}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Aspect: Purchase and Dynamic Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1d2022]/50 border border-[#3b494c]/20 p-6 rounded-3xl shadow-xl space-y-6 flex flex-col justify-between">
            <div>
              {/* Creator details */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-fixed text-lg">verified_user</span>
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Estúdio: <span className="text-white hover:underline cursor-pointer">{product.creator}</span>
                  </span>
                </div>
                
                {/* Rating average */}
                <div className="flex items-center gap-1 bg-[#272a2c] px-2.5 py-0.5 rounded text-xs text-[#ffb4ab]">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span className="font-mono font-bold">{product.rating}</span>
                </div>
              </div>

              {/* Title heading */}
              <h1 className="text-2xl md:text-3xl font-black font-display text-white leading-tight mb-3">
                {product.title}
              </h1>

              {/* Views and Downloads info widgets */}
              <div className="flex gap-4 mb-4 text-[10px] font-mono text-on-surface-variant">
                <span className="flex items-center gap-1 bg-[#101415]/50 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[13px]">visibility</span>
                  {product.views} Visualizações
                </span>
                <span className="flex items-center gap-1 bg-[#101415]/50 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[13px]">download</span>
                  {product.downloads} Downloads
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 font-body">
                {product.longDescription}
              </p>

              {/* Features bullets */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-mono text-primary uppercase tracking-wider font-bold">O que está incluso no pacote:</p>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#e0e3e5]">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buying Action Drawer */}
            <div className="bg-[#101415]/80 p-4 rounded-2xl border border-white/5">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">Valor total do Ativo</span>
                <div className="text-right">
                  <span className="text-primary-container text-2xl font-black font-mono">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-[#bac9cd]/50 block">Pagamento Único</span>
                </div>
              </div>

              {isPurchased ? (
                /* Dynamic Display states if purchased already! */
                <div className="space-y-2.5">
                  <div className="bg-primary/10 text-primary rounded-xl p-2.5 border border-primary/25 text-center text-xs font-medium">
                    ✓ Você já adquiriu este ativo digital!
                  </div>
                  <button
                    onClick={simulateDownload}
                    className="w-full bg-primary-container text-black font-extrabold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,224,255,0.25)] hover:scale-102 flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    BAIXAR ARQUIVO AGORA
                  </button>
                </div>
              ) : (
                /* Purchase Buttons */
                <div className="grid grid-cols-12 gap-2">
                  <button
                    onClick={() => navigate(`/checkout/${product.id}`)}
                    className="col-span-10 bg-primary-container text-black font-extrabold py-3 rounded-xl transition-all hover:scale-102 cursor-pointer shadow-[0_0_18px_rgba(0,224,255,0.3)] text-center text-sm"
                    id="checkout-trigger-btn"
                  >
                    ADQUIRIR ATIVO
                  </button>
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className={`col-span-2 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                      isFavorite 
                        ? 'bg-[#ffb4ab]/10 border-[#ffb4ab] text-[#ffb4ab]' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#bac9cd]'
                    }`}
                    title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: isFavorite ? "'FILL' 1" : undefined}}>
                      favorite
                    </span>
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
