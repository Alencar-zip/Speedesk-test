import { supabase } from '../lib/supabase';
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface ProductDetailsProps {
  products: Product[];
  libraryIds: (number | string)[];
  favoriteIds: (number | string)[];
  onToggleFavorite: (id: number | string) => void;
}

export default function ProductDetails({ products, libraryIds, favoriteIds, onToggleFavorite }: ProductDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Busca o produto comparando como string para suportar tanto UUID quanto Number
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

  const isPurchased = libraryIds.some(libId => String(libId) === String(product.id));
  const isFavorite = favoriteIds.some(favId => String(favId) === String(product.id));

  // LÓGICA DE DOWNLOAD REAL (CONFORME PDF PÁG. 5)
  const handleDownload = async () => {
  try {
    const path = product.file_path;
    if (!path) return alert("Arquivo nao encontrado no banco.");

    // 1. Gerar a URL Assinada
    const { data, error } = await supabase.storage
      .from('assets')
      .createSignedUrl(path, 60); // Link dura 60 segundos

    if (error) throw error;

    if (data?.signedUrl) {
      // 2. MÉTODO INFALÍVEL: Usar fetch para pegar o arquivo e criar um link local
      // Isso evita bloqueios de pop-up e problemas de domínio
      const response = await fetch(data.signedUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${product.title.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }
  } catch (err: any) {
    console.error(err);
    alert("Erro ao processar download.");
  }
};

  return (
    <div className="pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-primary transition-colors">Marketplace</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">{product.category}</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold truncate max-w-[150px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Esquerda: Visualizador */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#1d2022]/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={product.img} 
                alt={product.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-black/80 border border-white/10 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-primary uppercase">
                {product.format}
              </div>
            </div>
          </div>

          {/* Especificações Técnicas */}
          <div className="bg-[#1d2022] rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Especificações Técnicas</h4>
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
                <span className="font-bold text-white">{product.specs?.updates || 'Vitalícias'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direita: Compra e Ações */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1d2022]/50 border border-[#3b494c]/20 p-6 rounded-3xl shadow-xl space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
                  {product.creator}
                </span>
                <div className="bg-[#272a2c] px-2 py-0.5 rounded text-xs text-[#ffb4ab] font-bold">
                  ★ {product.rating || '5.0'}
                </div>
              </div>

              <h1 className="text-2xl font-black text-white leading-tight mb-3">{product.title}</h1>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">{product.description}</p>

              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest">Incluso no pacote:</p>
                {product.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#e0e3e5]">
                    <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#101415]/80 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between mb-4">
                <span className="text-xs font-mono text-on-surface-variant uppercase">Investimento</span>
                <span className="text-primary-container text-2xl font-black font-mono">
                  R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {isPurchased ? (
                <button 
                  onClick={handleDownload}
                  className="w-full bg-primary-container text-black font-black py-4 rounded-xl shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined">download</span>
                  BAIXAR ATIVO AGORA
                </button>
              ) : (
                <div className="grid grid-cols-12 gap-2">
                  <button 
                    onClick={() => navigate(`/checkout/${product.id}`)}
                    className="col-span-10 bg-primary-container text-black font-black py-4 rounded-xl shadow-lg text-sm"
                  >
                    ADQUIRIR ATIVO
                  </button>
                  <button 
                    onClick={() => onToggleFavorite(product.id)}
                    className={`col-span-2 rounded-xl flex items-center justify-center border transition-all ${
                      isFavorite ? 'bg-[#ffb4ab]/10 border-[#ffb4ab] text-[#ffb4ab]' : 'bg-white/5 border-white/10 text-[#bac9cd]'
                    }`}
                  >
                    <span className="material-symbols-outlined">{isFavorite ? 'favorite' : 'favorite_border'}</span>
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