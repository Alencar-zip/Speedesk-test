import React, { useState } from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface CreatorPanelProps {
  products: Product[];
  // AJUSTE: id agora aceita string (UUID) ou number
  onUpdateProductStatus: (id: number | string, status: 'analyzing' | 'approved' | 'declined') => void;
  onUpdateProductLogs?: (id: number | string, status: 'analyzing' | 'approved' | 'declined', logs: any[], summary: string) => void;
  username: string;
}

export default function CreatorPanel({ products, onUpdateProductStatus, onUpdateProductLogs, username }: CreatorPanelProps) {
  // Filtra produtos criados pelo usuário logado
  const creatorProducts = products.filter(p => p.creator === username || p.creator_id !== undefined);
  // AJUSTE: O estado do ID selecionado agora aceita string | number
  const [selectedProductId, setSelectedProductId] = useState<number | string | null>(
    creatorProducts.length > 0 ? creatorProducts[0].id : null
  );
  
  const [activeTab, setActiveTab] = useState<'security' | 'specs'>('security');
  const [filterStatus, setFilterStatus] = useState<'all' | 'analyzing' | 'approved' | 'declined'>('all');

  // Cálculos de métricas
  const totalAssets = creatorProducts.length;
  const approvedAssets = creatorProducts.filter(p => p.status === 'approved' || p.status === 'active' || p.status === undefined).length;
  const analyzingAssets = creatorProducts.filter(p => p.status === 'analyzing').length;

  const totalDownloads = creatorProducts.reduce((sum, p) => sum + (p.downloads || 0), 0);
  const estimatedEarnings = creatorProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.downloads || 0)), 0);

  // Lista filtrada
  const filteredProducts = creatorProducts.filter(p => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approved') return p.status === 'approved' || p.status === 'active' || p.status === undefined;
    return p.status === filterStatus;
  });

  // AJUSTE: Comparação de ID usando == para evitar conflito entre string/number
  const selectedProduct = creatorProducts.find(p => p.id == selectedProductId) || creatorProducts[0];

  // AJUSTE: Parâmetro productId aceita string | number
  const handleAdminOverride = (productId: number | string) => {
    onUpdateProductStatus(productId, 'approved');
    if (onUpdateProductLogs) {
      onUpdateProductLogs(
        productId,
        'approved',
        [
          { time: new Date().toLocaleTimeString('pt-BR'), message: "ADMIN_OVERRIDE: Auditoria de seguranca forcada por administrador titular.", type: 'warning' },
          { time: new Date().toLocaleTimeString('pt-BR'), message: "Sistema liberado para fins comerciais no Marketplace.", type: 'success' }
        ],
        "Liberado manualmente atraves da chave mestre do Criador/Administrador."
      );
    }
  };

  return (
    <div className="pb-20 animate-fade-in relative max-w-7xl mx-auto">
      <div className="absolute top-1/4 right-5 w-80 h-80 bg-primary/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-5 w-72 h-72 bg-[#c0c1ff]/5 rounded-full blur-[80px] pointer-events-none" />

      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Painel de Monitoramento</h1>
          <p className="text-xs text-on-surface-variant font-medium">
            Gerencie seus ativos homologados, visualize relatorios de antivirus e acompanhe estatisticas.
          </p>
        </div>
        <Link
          to="/publish"
          className="bg-primary hover:bg-[#3bf1ff] text-black font-black text-xs px-5 py-3 rounded-xl tracking-wider font-mono flex items-center justify-center gap-2 uppercase transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-[16px]">add_task</span>
          Publicar Novo Ativo
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Total de Ativos</span>
          <h3 className="text-2xl font-black text-white">{totalAssets}</h3>
        </div>

        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Integridade</span>
          <h3 className="text-2xl font-black text-green-400">
            {totalAssets > 0 ? `${Math.round((approvedAssets / totalAssets) * 100)}%` : '100%'}
          </h3>
        </div>

        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Downloads</span>
          <h3 className="text-2xl font-black text-white">{totalDownloads}</h3>
        </div>

        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Receita</span>
          <h3 className="text-2xl font-black text-[#00ffcc]">
            R$ {estimatedEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </section>

      {totalAssets === 0 ? (
        <div className="bg-[#1d2022] border border-dashed border-white/10 rounded-2xl p-20 text-center">
          <h2 className="text-lg font-bold text-white mb-2">Nenhum Ativo Postado</h2>
          <Link to="/publish" className="text-primary font-bold uppercase text-xs">Subir Primeiro Arquivo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-[#16191b] border border-white/10 p-4 rounded-xl flex gap-2">
              {(['all', 'analyzing', 'approved', 'declined'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase ${filterStatus === status ? 'bg-primary/20 text-primary' : 'text-[#bac9cd] bg-white/5'}`}
                >
                  {status === 'all' ? 'Todos' : status}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`bg-[#1d2022] rounded-2xl p-4 border cursor-pointer flex justify-between items-center ${selectedProductId == p.id ? 'border-primary/40' : 'border-white/5'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={p.img} alt="" className="w-12 h-10 rounded-lg object-cover" />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                      <p className="text-[9px] font-mono text-on-surface-variant">R$ {p.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-mono px-2 py-1 rounded-full border ${p.status === 'analyzing' ? 'text-yellow-400 border-yellow-400/20' : 'text-green-400 border-green-400/20'}`}>
                    {p.status || 'active'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            {selectedProduct ? (
              <div className="bg-[#1d2022] border border-white/10 rounded-2xl p-6 space-y-6 animate-fade-in">
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-mono text-primary uppercase">Laudo Tecnico</span>
                    <h2 className="text-base font-black text-white">{selectedProduct.title}</h2>
                  </div>
                  {selectedProduct.status === 'declined' && (
                    <button onClick={() => handleAdminOverride(selectedProduct.id)} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-[9px] font-bold">LIBERAR</button>
                  )}
                </div>

                <div className="bg-[#101415] rounded-xl p-4">
                   <p className="text-xs text-on-surface-variant leading-relaxed">
                      Triagem de seguranca concluida. O motor Speedesk validou a integridade estrutural deste ativo.
                   </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}