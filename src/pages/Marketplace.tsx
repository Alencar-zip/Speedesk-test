import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface MarketplaceProps {
  products: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
}

export default function Marketplace({ products, searchQuery, onSearchChange, favoriteIds, onToggleFavorite }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const navigate = useNavigate();

  const categories = ['TODOS', 'FAVORITOS', 'SLIDES', 'UI KIT', '3D MODEL'];

  // Filter products based on search in header AND category selected on page
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = false;
    if (selectedCategory === 'TODOS') {
      matchesCategory = true;
    } else if (selectedCategory === 'FAVORITOS') {
      matchesCategory = favoriteIds.includes(product.id);
    } else {
      matchesCategory = product.category.toUpperCase() === selectedCategory;
    }

    const isApproved = product.status === undefined || product.status === 'approved';
    return matchesSearch && matchesCategory && isApproved;
  });

  const featuredProduct = products.find(p => p.id === 1) || products[0];

  return (
    <div className="pb-16 animate-fade-in">
      
      {/* Featured Banner Hero */}
      {!searchQuery && selectedCategory === 'TODOS' && (
        <section className="mb-12 relative h-[360px] md:h-[400px] rounded-3xl overflow-hidden group border border-white/5">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4PFy1MhOfxRrb21BCoyXDhREBoFAAQTs_gcaxHo3gpGHJowKsSBU_cI8yafqzfCJtoIqjo8slloHk3y8gCyiNEAUnktzicoz84TYEx0M9C5IvmsD4kXwzR5Bf9EioT2Yk9wZaEvxI52ca__p95Pl2GTnAbVjAkOusM_Z-Bw3O0h7Q7Y5D1Ks3Mk-_KNQetEgA3nyoebZeGUm-_Qk2xR8NY5ntTJ2yKNvqh4FOBenOTQfLD5bRednvRLhwsaAWuS3ScaMAf-DcTg')` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101415] via-[#101415]/60 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold">
                ESTREIA GLOBAL
              </span>
              <span className="bg-white/10 text-white text-[9px] font-mono px-2 py-1 rounded-full">
                ★ 5.0
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white mt-1 mb-4 leading-tight font-display tracking-tighter">
              Eleve sua Visão Digital
            </h1>
            <p className="text-on-surface-variant text-sm md:text-base mb-6 font-body leading-relaxed">
              Descubra templates profissionais, decks de investimentos e kits de design ultra-polidos em <span className="text-primary font-bold">Glassmorphism</span> e estética <span className="text-primary-container font-bold">Aetheric Flux</span>.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate(`/product/${featuredProduct.id}`)}
                className="bg-primary-container text-black font-extrabold px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(0,224,255,0.4)] hover:scale-105 transition-all text-sm cursor-pointer"
              >
                Ver Destaque de Hoje
              </button>
              <button 
                onClick={() => setSelectedCategory('SLIDES')}
                className="bg-white/5 hover:bg-white/10 text-[#e0e3e5] border border-white/10 font-medium px-5 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
              >
                Acessar Slides
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Title & Quick search results info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <span>Explorar Biblioteca</span>
            {searchQuery && (
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-normal">
                Resultado para: "{searchQuery}"
              </span>
            )}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Ativos de alta performance selecionados manualmente.
          </p>
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-1.5 p-1 bg-[#191c1e] border border-white/5 rounded-xl self-start overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all uppercase tracking-wider cursor-pointer whitespace-nowrap ${
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

      {/* Grid of Products */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isFav = favoriteIds.includes(p.id);
            return (
              <div 
                key={p.id} 
                className="bg-[#1d2022] border border-white/5 rounded-2xl overflow-hidden hover:translate-y-[-6px] transition-all duration-300 group flex flex-col h-full relative"
                id={`marketplace-card-${p.id}`}
              >
                {/* Card Image */}
                <div className="aspect-video relative overflow-hidden shrink-0">
                  <img 
                    src={p.img} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Format Sticker */}
                  <div className="absolute top-3 right-3 bg-black/80 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold text-primary border border-white/10 uppercase tracking-widest">
                    {p.format}
                  </div>

                  {/* Quick toggle heart button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(p.id);
                    }}
                    className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      isFav 
                        ? 'bg-[#ffb4ab]/90 hover:bg-[#ffb4ab] border-[#ffb4ab] text-black shadow-md' 
                        : 'bg-[#101415]/70 hover:bg-[#101415]/90 border-white/10 text-[#bac9cd] hover:text-[#ffb4ab]'
                    }`}
                    title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <span className="material-symbols-outlined text-[15px] select-none align-middle" style={{fontVariationSettings: isFav ? "'FILL' 1" : undefined}}>
                      favorite
                    </span>
                  </button>
                  
                  {/* Category Sticker */}
                  <div className="absolute bottom-3 left-3 bg-[#191c1e] px-2 py-0.5 rounded text-[8px] font-mono text-on-surface-variant border border-white/5 uppercase">
                    {p.category}
                  </div>
                </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-on-surface-variant/70 tracking-tight">
                      Criador: <span className="font-semibold text-on-surface">{p.creator}</span>
                    </span>
                    <span className="text-[10px] text-[#ffb4ab] font-bold flex items-center gap-0.5">
                      ★ {p.rating}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors font-display">
                    {p.title}
                  </h3>
                  
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                {/* Card Action Section */}
                <div className="bg-[#101415]/50 p-3 rounded-xl border border-white/5 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest block">Preço</span>
                    <span className="text-primary-container font-mono text-base font-extrabold">
                      R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/product/${p.id}`} 
                      className="bg-[#272a2c] hover:bg-[#3b494c] text-white text-[10px] font-mono font-bold px-3.5 py-2 rounded-lg transition-colors border border-white/5"
                      id={`marketplace-card-btn-details-${p.id}`}
                    >
                      DETALHES
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        /* Empty Search State or Empty Favorites State */
        selectedCategory === 'FAVORITOS' ? (
          <div className="text-center py-24 bg-[#1d2022]/10 rounded-3xl border border-dashed border-[#3b494c]/30">
            <div className="w-16 h-16 bg-[#191c1e] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#ffb4ab]">
              <span className="material-symbols-outlined text-4xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
            </div>
            <h3 className="text-xl font-bold text-white font-display">Sem itens favoritados</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto px-4 mt-2 leading-relaxed">
              Você ainda não favoritou nenhum layout. Navegue pelas nossas apresentações e clique no coração de qualquer ativo para guardá-lo aqui de forma fácil!
            </p>
            <button
              onClick={() => setSelectedCategory('TODOS')}
              className="mt-6 bg-[#00e0ff] text-[#00363f] font-mono font-bold px-6 py-2.5 rounded-xl text-xs hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,224,255,0.3)] cursor-pointer uppercase"
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#1d2022]/10 rounded-3xl border border-dashed border-[#3b494c]/30">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 select-none">search_off</span>
            <h3 className="text-lg font-bold text-white font-display mb-1">Nenhum ativo encontrado</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto px-4 leading-relaxed">
              Não encontramos resultados para a busca selecionada. Tente usar palavras-chave mais comuns como "Slides", "Quantum" ou limpe a pesquisa.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                setSelectedCategory('TODOS');
              }}
              className="mt-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Limpar Filtros e Buscas
            </button>
          </div>
        )
      )}
    </div>
  );
}
