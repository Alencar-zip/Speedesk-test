import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface LibraryProps {
  products: Product[];
  libraryIds: (number | string)[]; // Ajustado para aceitar UUID
}

export default function Library({ products, libraryIds }: LibraryProps) {
  const navigate = useNavigate();

  // FILTRO CORRIGIDO: Compara como string para não dar erro entre UUID e Number
  const ownedProducts = products.filter(p => 
    libraryIds.some(libId => String(libId) === String(p.id))
  );

  // LÓGICA DE DOWNLOAD REAL (CONFORME O SISTEMA DE CUSTÓDIA)
  const handleRealDownload = async (product: Product) => {
    try {
      const filePath = product.file_path;
      
      if (!filePath) {
        alert("Erro: Este ativo não possui arquivo físico vinculado.");
        return;
      }

      // Gerar link seguro de 15 minutos
      const { data, error } = await supabase.storage
        .from('assets')
        .createSignedUrl(filePath, 900);

      if (error) throw error;

      if (data?.signedUrl) {
        // Forçar download via Blob para evitar bloqueios de navegador
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${product.title.replace(/\s+/g, '_')}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      console.error(err);
      alert("Falha ao processar o download seguro.");
    }
  };

  return (
    <div className="pb-20 animate-fade-in relative">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-[90px] pointer-events-none" />

      <header className="mb-10">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Sua Coleção</h1>
        <p className="text-xs text-on-surface-variant font-medium">Acesse e faça o download de seus ativos validados e adquiridos.</p>
      </header>

      {ownedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownedProducts.map((p) => (
            <div 
              key={p.id} 
              className="bg-[#1d2022] border border-white/5 rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300 group flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest">
                    Adquirido
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-mono text-primary/50 uppercase tracking-wider block font-bold">
                    {p.format} • {p.specs?.size || 'N/A'}
                  </span>
                  
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors font-display line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1">
                <div className="bg-[#101415]/60 p-3 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-on-surface-variant/70 uppercase">Status</span>
                    <span className="font-semibold text-green-400">LIBERADO</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
                    <button
                      onClick={() => handleRealDownload(p)}
                      className="bg-primary text-black py-2.5 rounded-lg text-center flex items-center justify-center gap-1 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,224,255,0.2)] hover:scale-102"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      BAIXAR
                    </button>
                    <Link
                      to={`/product/${p.id}`}
                      className="bg-[#272a2c] hover:bg-[#3b494c] text-white py-2.5 rounded-lg text-center flex items-center justify-center gap-1 transition-all border border-white/5"
                    >
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      INFO
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#1d2022]/10 rounded-3xl border border-dashed border-[#3b494c]/30">
          <div className="w-16 h-16 bg-[#191c1e] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#bac9cd]/30">
            <span className="material-symbols-outlined text-4xl">folder_off</span>
          </div>
          <h3 className="text-xl font-bold text-white">Sua coleção está vazia</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-2">
            Navegue pelo Marketplace para adquirir ativos e começar sua biblioteca digital técnica.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-primary text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg cursor-pointer"
          >
            Explorar Catálogo
          </button>
        </div>
      )}
    </div>
  );
}