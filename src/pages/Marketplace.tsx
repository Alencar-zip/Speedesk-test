import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface MarketplaceProps {
  products: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoriteIds: (number | string)[];
  onToggleFavorite: (id: number | string) => void;
}

export default function Marketplace({ products, searchQuery, onSearchChange, favoriteIds, onToggleFavorite }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const navigate = useNavigate();

  const categories = ['TODOS', 'FAVORITOS', 'SLIDES', 'UI KIT', '3D MODEL'];

  // Lógica de filtragem dos produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.creator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = false;
    if (selectedCategory === 'TODOS') {
      matchesCategory = true;
    } else if (selectedCategory === 'FAVORITOS') {
      matchesCategory = favoriteIds.includes(String(product.id)) || favoriteIds.includes(Number(product.id));
    } else {
      matchesCategory = product.category.toUpperCase() === selectedCategory;
    }

    const isApproved = product.status === 'active' || product.status === 'approved' || product.status === undefined;
    return matchesSearch && matchesCategory && isApproved;
  });

  return (
    <div className="pb-16 animate-fade-in">
      
      {/* O Banner Hero foi removido conforme solicitado */}

      {/* Título e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Explorar Biblioteca 
            {searchQuery && (
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono">
                Busca: {searchQuery}
              </span>
            )}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Ativos técnicos de alta performance.
          </p>
        </div>

        {/* Carrossel de Categorias */}
        <div className="flex items-center gap-1.5 p-1 bg-[#191c1e] border border-white/5 rounded-xl overflow-x-auto">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`px-5 py-2 rounded-lg text-[10px] font-mono font-bold transition-all uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                selectedCategory === cat 
                ? 'bg-primary text-black shadow-[0_0_12px_rgba(186,242,255,0.3)]' 
                : 'text-[#bac9cd]/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Ativos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isFav = favoriteIds.includes(String(p.id)) || favoriteIds.includes(Number(p.id));
            return (
              <div 
                key={p.id} 
                className="bg-[#1d2022] border border-white/5 rounded-2xl overflow-hidden hover:translate-y-[-6px] transition-all duration-300 flex flex-col h-full relative group shadow-lg"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={p.img} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute top-3 right-3 bg-black/80 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold text-primary border border-white/10 uppercase">
                    {p.format}
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleFavorite(p.id);
                    }}
                    className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      isFav 
                        ? 'bg-[#ffb4ab] border-[#ffb4ab] text-black shadow-md' 
                        : 'bg-black/60 border-white/10 text-white/50 hover:text-[#ffb4ab]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]" style={{fontVariationSettings: isFav ? "'FILL' 1" : undefined}}>
                      favorite
                    </span>
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-on-surface-variant/70 uppercase">
                        By {p.creator}
                      </span>
                      <span className="text-[10px] text-[#ffb4ab] font-bold">★ 5.0</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors font-display tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                      {p.description}
                    </p>
                  </div>

                  <div className="bg-[#101415]/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest block">Preço</span>
                      <span className="text-primary-container font-mono text-base font-extrabold">
                        R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Link 
                      to={`/product/${p.id}`} 
                      className="bg-[#272a2c] hover:bg-[#3b494c] text-white text-[10px] font-mono font-bold px-4 py-2 rounded-lg transition-colors border border-white/5"
                    >
                      DETALHES
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#1d2022]/10 rounded-3xl border border-dashed border-[#3b494c]/30">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">search_off</span>
          <h3 className="text-lg font-bold text-white">Nenhum ativo localizado</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-2">
            Ajuste os filtros ou o termo de busca para encontrar o layout ideal.
          </p>
          <button onClick={() => {onSearchChange(''); setSelectedCategory('TODOS');}} className="mt-6 text-primary text-xs font-mono font-bold uppercase hover:underline cursor-pointer">Limpar Busca</button>
        </div>
      )}
    </div>
  );
}