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

    // AJUSTE: Aceita 'active' ou 'approved' para aparecer na loja
    const isApproved = product.status === 'active' || product.status === 'approved' || product.status === undefined;
    return matchesSearch && matchesCategory && isApproved;
  });

  const featuredProduct = products[0] || { id: '0' };

  return (
    <div className="pb-16 animate-fade-in">
      {!searchQuery && selectedCategory === 'TODOS' && (
        <section className="mb-12 relative h-[360px] md:h-[400px] rounded-3xl overflow-hidden group border border-white/5">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4PFy1MhOfxRrb21BCoyXDhREBoFAAQTs_gcaxHo3gpGHJowKsSBU_cI8yafqzfCJtoIqjo8slloHk3y8gCyiNEAUnktzicoz84TYEx0M9C5IvmsD4kXwzR5Bf9EioT2Yk9wZaEvxI52ca__p95Pl2GTnAbVjAkOusM_Z-Bw3O0h7Q7Y5D1Ks3Mk-_KNQetEgA3nyoebZeGUm-_Qk2xR8NY5ntTJ2yKNvqh4FOBenOTQfLD5bRednvRLhwsaAWuS3ScaMAf-DcTg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101415] via-[#101415]/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">Eleve sua Visão Digital</h1>
            <div className="flex gap-3">
              <button onClick={() => navigate(`/product/${featuredProduct.id}`)} className="bg-primary-container text-black font-extrabold px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all text-sm">Ver Destaque</button>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Explorar Biblioteca {searchQuery && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Busca: {searchQuery}</span>}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[#191c1e] border border-white/5 rounded-xl overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${selectedCategory === cat ? 'bg-primary text-black' : 'text-[#bac9cd]/70 hover:bg-white/5'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-[#1d2022] border border-white/5 rounded-2xl overflow-hidden hover:translate-y-[-6px] transition-all duration-300 flex flex-col h-full">
            <div className="aspect-video relative overflow-hidden">
              <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
              <div className="absolute top-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-primary uppercase">{p.format}</div>
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{p.title}</h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">{p.description}</p>
              </div>
              <div className="bg-[#101415]/50 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-primary-container font-mono text-base font-extrabold">R$ {Number(p.price).toFixed(2)}</span>
                <Link to={`/product/${p.id}`} className="bg-[#272a2c] text-white text-[10px] font-mono px-3.5 py-2 rounded-lg border border-white/5">DETALHES</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}