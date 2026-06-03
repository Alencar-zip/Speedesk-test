import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface LibraryProps {
  products: Product[];
  libraryIds: number[];
}

export default function Library({ products, libraryIds }: LibraryProps) {
  const navigate = useNavigate();

  // Filter owned products based on libraryIds state
  const ownedProducts = products.filter(p => libraryIds.includes(p.id));

  const triggerDownload = (product: Product) => {
    alert(`Iniciando download seguro na rede Speedesk...\nAtivo: "${product.title}"\nFormato: ${product.specs.fileFormat || '.zip'}\nTamanho: ${product.specs.size}\nSua licença comercial foi vinculada com segurança!`);
  };

  return (
    <div className="pb-20 animate-fade-in relative">
      {/* Background glowing particles simulation */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Sua Coleção</h1>
        <p className="text-xs text-on-surface-variant">Acesse e faça o download de seus modelos de apresentação e kits de UI adquiridos.</p>
      </header>

      {ownedProducts.length > 0 ? (
        /* Library list grid component */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ownedProducts.map((p) => (
            <div 
              key={p.id} 
              className="bg-[#1d2022] border border-white/5 rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300 group flex flex-col justify-between"
              id={`library-card-${p.id}`}
            >
              <div>
                {/* Product Cover image */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 text-primary border border-white/5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest">
                    Adquirido
                  </div>
                </div>

                {/* Information detail fields */}
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-mono text-[#bac9cd]/50 uppercase tracking-wider block">
                    Formato {p.format} • {p.specs.size}
                  </span>
                  
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors font-display line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              {/* Action buttons drawer */}
              <div className="px-5 pb-5 pt-1">
                <div className="bg-[#101415]/60 p-3 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-on-surface-variant/70 uppercase">ID Licença</span>
                    <span className="font-semibold text-primary">LIC-SP-{p.id}-{Math.floor(100+Math.random()*900)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
                    <button
                      onClick={() => triggerDownload(p)}
                      className="bg-primary-container hover:bg-primary-container/80 text-black py-2 rounded-lg text-center flex items-center justify-center gap-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,224,255,0.15)]"
                    >
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      BAIXAR
                    </button>
                    <Link
                      to={`/product/${p.id}`}
                      className="bg-[#272a2c] hover:bg-[#3b494c] text-white py-2 rounded-lg text-center flex items-center justify-center gap-1 transition-all border border-white/5"
                    >
                      <span className="material-symbols-outlined text-[15px]">info</span>
                      DETALHES
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty collection widget layout */
        <div className="text-center py-24 bg-[#1d2022]/10 rounded-3xl border border-dashed border-[#3b494c]/30">
          <div className="w-16 h-16 bg-[#191c1e] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#bac9cd]/30">
            <span className="material-symbols-outlined text-4xl select-none">folder_off</span>
          </div>
          <h3 className="text-xl font-bold text-white font-display">Sem ativos adquiridos</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto px-4 mt-2 leading-relaxed">
            Seu portfólio está limpo. Navegue pelo nosso catálogo de layouts cibernéticos na página inicial para começar sua jornada!
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-primary-container text-black font-extrabold px-6 py-2.5 rounded-xl text-xs font-mono tracking-wider hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,224,255,0.25)] cursor-pointer"
          >
            Explorar Marketplace
          </button>
        </div>
      )}
    </div>
  );
}
