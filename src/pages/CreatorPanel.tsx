import React, { useState } from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface CreatorPanelProps {
  products: Product[];
  onUpdateProductStatus: (id: number, status: 'analyzing' | 'approved' | 'declined') => void;
  onUpdateProductLogs?: (id: number, status: 'analyzing' | 'approved' | 'declined', logs: any[], summary: string) => void;
  username: string;
}

export default function CreatorPanel({ products, onUpdateProductStatus, onUpdateProductLogs, username }: CreatorPanelProps) {
  // Filter list of products owned/published by the user
  const creatorProducts = products.filter(p => p.creator === username || p.status !== undefined);

  // States for selected product to view reports/metrics
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'security' | 'specs'>('security');
  const [filterStatus, setFilterStatus] = useState<'all' | 'analyzing' | 'approved' | 'declined'>('all');

  // Calculate metrics
  const totalAssets = creatorProducts.length;
  const approvedAssets = creatorProducts.filter(p => p.status === 'approved' || p.status === undefined).length;
  const analyzingAssets = creatorProducts.filter(p => p.status === 'analyzing').length;
  const declinedAssets = creatorProducts.filter(p => p.status === 'declined').length;

  const totalViews = creatorProducts.reduce((sum, p) => sum + p.views, 0);
  const totalDownloads = creatorProducts.reduce((sum, p) => sum + p.downloads, 0);
  // Estimate earnings assuming 10% premium comissão or direct sale
  const estimatedEarnings = creatorProducts.reduce((sum, p) => sum + (p.price * p.downloads), 0);

  // Filtered list
  const filteredProducts = creatorProducts.filter(p => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approved') return p.status === 'approved' || p.status === undefined;
    return p.status === filterStatus;
  });

  const selectedProduct = creatorProducts.find(p => p.id === selectedProductId) || creatorProducts[0];

  const handleAdminOverride = (productId: number) => {
    onUpdateProductStatus(productId, 'approved');
    if (onUpdateProductLogs) {
      onUpdateProductLogs(
        productId,
        'approved',
        [
          { time: new Date().toLocaleTimeString('pt-BR'), message: "ADMIN_OVERRIDE: Auditoria de segurança forçada por administrador titular.", type: 'warning' },
          { time: new Date().toLocaleTimeString('pt-BR'), message: "Sistema liberado para fins comerciais no Marketplace.", type: 'success' }
        ],
        "Liberado manualmente através da chave mestre do Criador/Administrador."
      );
    }
  };

  return (
    <div className="pb-20 animate-fade-in relative max-w-7xl mx-auto">
      {/* Background soft glowing lights */}
      <div className="absolute top-1/4 right-5 w-80 h-80 bg-primary/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-5 w-72 h-72 bg-[#c0c1ff]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary font-display tracking-tighter mb-2">Painel de Monitoramento</h1>
          <p className="text-xs text-on-surface-variant font-medium">
            Gerencie seus ativos homologados, visualize relatórios de antivírus integrados e acompanhe estatísticas de downloads e lucros.
          </p>
        </div>
        <Link
          to="/publish"
          className="bg-primary hover:bg-[#3bf1ff] hover:scale-102 text-black font-black text-xs px-5 py-3 rounded-xl tracking-wider font-mono flex items-center justify-center gap-2 self-start md:self-center uppercase transition-all shadow-[0_4px_15px_rgba(0,224,255,0.25)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add_task</span>
          Publicar Novo Ativo
        </Link>
      </header>

      {/* STATS OVERVIEW SECTION */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat 1: Total Assets */}
        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Total de Ativos</span>
            <span className="material-symbols-outlined text-primary text-xl select-none">layers</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-display">{totalAssets}</h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">Cargas enviadas no feed</p>
          </div>
        </div>

        {/* Stat 2: Security Health */}
        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Status de Integridade</span>
            <span className="material-symbols-outlined text-green-400 text-xl select-none">security</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-green-400 font-display">
              {totalAssets > 0 ? `${Math.round((approvedAssets / totalAssets) * 100)}%` : '100%'}
            </h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">
              {analyzingAssets > 0 ? `${analyzingAssets} sob escaneamento ativo` : 'Todos os ativos auditados'}
            </p>
          </div>
        </div>

        {/* Stat 3: Total Downloads */}
        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Downloads Reais</span>
            <span className="material-symbols-outlined text-primary-container text-xl select-none font-bold">download_done</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-display">{totalDownloads}</h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">Traders que baixaram os arquivos</p>
          </div>
        </div>

        {/* Stat 4: Estimated Earnings */}
        <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Receita Operacional</span>
            <span className="material-symbols-outlined text-[#00ffcc] text-xl select-none">payments</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#00ffcc] font-display">
              R$ {estimatedEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1">Calculado sobre downloads comerciais</p>
          </div>
        </div>
      </section>

      {/* CORE WORKSPACE GRID */}
      {totalAssets === 0 ? (
        <div className="bg-[#1d2022] border border-dashed border-white/10 rounded-2xl p-12 text-center py-20">
          <span className="material-symbols-outlined text-5xl text-[#bac9cd]/20 mb-4 select-none">shield_with_heart</span>
          <h2 className="text-lg font-bold text-white font-display mb-2">Nenhum Ativo Postado Ainda</h2>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6">
            Você ainda não catalogou nenhum produto próprio para o mercado. Suba seu primeiro arquivo .ZIP com layouts incríveis para começar a coletar análises de malware da IA e downloads.
          </p>
          <Link
            to="/publish"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#baf2ff] to-primary text-black font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all hover:scale-101"
          >
            <span className="material-symbols-outlined text-sm font-bold">cloud_upload</span>
            Subir Primeiro Arquivo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT LIST: ALL REGISTERED PRODUCTS & MONITORING BADGES */}
          <div className="lg:col-span-6 space-y-4">

            {/* Filter and searching tool header */}
            <div className="bg-[#16191b] border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
              <span className="text-[9px] font-mono uppercase text-[#bac9cd] font-bold">Filtrar Ativos</span>
              <div className="flex gap-1">
                {(['all', 'analyzing', 'approved', 'declined'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all tracking-wider ${filterStatus === status
                      ? 'bg-primary/20 text-primary border border-primary/20 shadow-xs'
                      : 'text-[#bac9cd] hover:text-white bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                  >
                    {status === 'all' ? 'Ver Todos' : status === 'analyzing' ? 'Em análise' : status === 'approved' ? 'Aprovados' : 'Quarentena'}
                  </button>
                ))}
              </div>
            </div>

            {/* List and Cards */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductId === p.id || (selectedProductId === null && creatorProducts[0].id === p.id);

                const statusTheme =
                  p.status === 'approved' || p.status === undefined
                    ? { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: 'check_circle', label: 'Monitorado & Ativo' }
                    : p.status === 'declined'
                      ? { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: 'gpp_bad', label: 'Suspeito / Quarentena' }
                      : { bg: 'bg-yellow-500/5 animate-pulse', text: 'text-yellow-400', border: 'border-yellow-500/15', icon: 'sync', label: 'Sob Análise API' };

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`bg-[#1d2022] rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-4 ${isSelected
                      ? 'border-primary/40 bg-[#1d2022] shadow-[0_4px_25px_rgba(0,186,255,0.05)]'
                      : 'border-white/5 hover:border-white/10 hover:bg-[#1d2022]'
                      }`}
                  >
                    <div className="flex items-center gap-3.5 truncate min-w-0">
                      {/* Image Preview */}
                      <div className="w-14 h-12 rounded-xl overflow-hidden bg-[#101415] border border-white/10 relative shrink-0">
                        <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                        {p.status === 'analyzing' && (
                          <div className="absolute inset-0 bg-[#101415]/70 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px] text-yellow-400 animate-spin">sync</span>
                          </div>
                        )}
                      </div>

                      {/* Info and size */}
                      <div className="truncate min-w-0">
                        <h4 className="text-xs font-bold text-white truncate leading-snug">{p.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-on-surface-variant">
                          <span className="uppercase">{p.format}</span>
                          <span>•</span>
                          <span>{p.specs.size || '1.2 MB'}</span>
                          <span>•</span>
                          <span className="text-primary-container font-semibold">R$ {p.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill Indicator */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-widest border ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}>
                        <span className={`material-symbols-outlined text-[10px] ${p.status === 'analyzing' ? 'animate-spin' : ''}`}>{statusTheme.icon}</span>
                        {statusTheme.label}
                      </span>
                      {p.downloads > 0 && (
                        <span className="text-[8px] font-mono text-on-surface-variant/70 tracking-tight">{p.downloads} downloads</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="bg-[#1d2022]/20 border border-dashed border-white/5 rounded-2xl p-8 text-center text-xs text-on-surface-variant">
                  Nenhum ativo correspondente ao filtro encontrado.
                </div>
              )}
            </div>
          </div>


          {/* RIGHT VIEW: EXPANDED MALWARE SCANNER LOGS & SPECS ANALYSIS REPORT */}
          <div className="lg:col-span-6 space-y-6">
            {selectedProduct ? (
              <div className="bg-[#1d2022] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-fade-in">

                {/* Header detail of product */}
                <div className="flex items-start gap-4 pb-4 border-b border-white/5 justify-between">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-primary font-bold tracking-widest uppercase mb-1 block">Laudo Técnico do Ativo</span>
                    <h2 className="text-base font-black text-white truncate font-display leading-tight">{selectedProduct.title}</h2>
                    <p className="text-[10px] text-on-surface-variant font-mono mt-0.5 truncate">Arquivo auditado: {selectedProduct.zipFileName || 'package.zip'}</p>
                  </div>

                  {/* Actions for simulation overide */}
                  {selectedProduct.status === 'declined' && (
                    <button
                      onClick={() => handleAdminOverride(selectedProduct.id)}
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30 pl-2.5 pr-3 py-1.5 rounded-lg border border-green-500/20 text-[9px] font-mono font-bold uppercase transition-all shrink-0 flex items-center gap-1"
                      title="Clique para autorizar manualmente o marketplace"
                    >
                      <span className="material-symbols-outlined text-[12px] font-bold">check_circle</span>
                      Forçar Liberação [Admin]
                    </button>
                  )}
                </div>

                {/* Sub Tab selection */}
                <div className="flex border-b border-white/5 gap-2">
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`pb-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider relative ${activeTab === 'security' ? 'text-primary' : 'text-on-surface-variant hover:text-white'
                      }`}
                  >
                    Auditoria Antivírus IA
                    {activeTab === 'security' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_#00e0ff]" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2.5 px-3 text-xs font-mono font-bold uppercase tracking-wider relative ${activeTab === 'specs' ? 'text-primary' : 'text-on-surface-variant hover:text-white'
                      }`}
                  >
                    Especificações do Ativo
                    {activeTab === 'specs' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_#00e0ff]" />
                    )}
                  </button>
                </div>

                {/* TAB 1: SECURITY DETAILED REPORT */}
                {activeTab === 'security' && (
                  <div className="space-y-4">

                    {/* Visual box of overall scan verdict */}
                    {selectedProduct.status === 'analyzing' ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 space-y-3">
                        <div className="flex gap-2.5 items-center">
                          <span className="material-symbols-outlined text-yellow-400 text-xl select-none animate-spin">sync</span>
                          <h4 className="font-bold text-white font-display text-xs">Varredura em execução...</h4>
                        </div>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">
                          O arquivo compactado foi enviado para o Sandbox remoto. O motor Speedesc Heuristics com Inteligência Artificial do Gemini está inspecionando scripts ocultos, macros, hashes, integridade estrutural e vulnerabilidades em lote.
                        </p>
                      </div>
                    ) : selectedProduct.status === 'declined' ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
                        <div className="flex gap-2.5 items-center">
                          <span className="material-symbols-outlined text-red-400 text-xl select-none">gpp_bad</span>
                          <h4 className="font-bold text-white font-display text-xs uppercase tracking-wider">Ameaça Identificada • Bloqueado</h4>
                        </div>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">
                          {selectedProduct.scanSummary || "Malware detectado na estrutura do empacotamento. O conteúdo foi retido preventivamente em quarentena de segurança e sua venda foi suspensa de forma absoluta de modo a blindar os traders."}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
                        <div className="flex gap-2.5 items-center">
                          <span className="material-symbols-outlined text-green-400 text-xl select-none">verified_user</span>
                          <h4 className="font-bold text-white font-display text-xs uppercase tracking-wider">Sem ameaças • Autenticado</h4>
                        </div>
                        <p className="text-[10px] text-on-surface-variant leading-relaxed">
                          {selectedProduct.scanSummary || "O ativo superou com sucesso todos os checklists de barreira em sandbox heurístico do Gemini. Nenhuma assinatura prejudicial similar a worms, ransomwares ou Cavalos de Troia foi registrada."}
                        </p>
                      </div>
                    )}

                    {/* Technical log stream terminal */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-on-surface-variant/80 uppercase font-bold tracking-wider">Histórico de Verificação (Console Técnico):</span>
                      <div className="bg-[#101415] border border-white/5 rounded-xl p-4 font-mono text-[9px] space-y-2 max-h-[220px] overflow-y-auto leading-normal">
                        {selectedProduct.scanLogs && selectedProduct.scanLogs.length > 0 ? (
                          selectedProduct.scanLogs.map((log, index) => (
                            <div key={index} className="flex gap-2.5 select-text">
                              <span className="text-on-surface-variant/40 shrink-0">[{log.time}]</span>
                              <span className={
                                log.type === 'success' ? 'text-green-400' :
                                  log.type === 'warning' ? 'text-yellow-400 font-bold' :
                                    log.type === 'error' ? 'text-red-400 font-bold' : 'text-[#bac9cd]/80'
                              }>
                                {log.message}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[#bac9cd]/30 text-center py-6">
                            Nenhum registro de log para o período.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SPECIFICATIONS REVIEW */}
                {activeTab === 'specs' && (
                  <div className="space-y-4">
                    <p className="text-[10px] text-[#bac9cd] leading-relaxed">
                      Detalhamento do pacote configurado para análise estrutural no Speedesc Marketplace:
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Weight / Size */}
                      <div className="bg-[#101415]/50 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-lg">database</span>
                        <div>
                          <p className="text-[8px] font-mono text-on-surface-variant uppercase font-bold">Tamanho compactado</p>
                          <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedProduct.specs.size}</p>
                        </div>
                      </div>

                      {/* Soft */}
                      <div className="bg-[#101415]/50 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary-container text-lg">code</span>
                        <div>
                          <p className="text-[8px] font-mono text-on-surface-variant uppercase font-bold">Software requerido</p>
                          <p className="text-xs font-bold text-white font-mono mt-0.5 truncate max-w-[130px]">{selectedProduct.specs.software}</p>
                        </div>
                      </div>

                      {/* Resolution */}
                      <div className="bg-[#101415]/50 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#00ffcc] text-lg">aspect_ratio</span>
                        <div>
                          <p className="text-[8px] font-mono text-on-surface-variant uppercase font-bold">Definição / Proporção</p>
                          <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedProduct.specs.resolution}</p>
                        </div>
                      </div>

                      {/* Slides count */}
                      <div className="bg-[#101415]/50 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-lg">photo_library</span>
                        <div>
                          <p className="text-[8px] font-mono text-on-surface-variant uppercase font-bold">Slides Inclusos</p>
                          <p className="text-xs font-bold text-white font-mono mt-0.5">{selectedProduct.specs.slidesCount || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      <span className="text-[9px] font-mono text-on-surface-variant/80 uppercase font-bold">Destaques Comerciais:</span>
                      <ul className="space-y-1.5 pl-1">
                        {selectedProduct.features && selectedProduct.features.map((feat, i) => (
                          <li key={i} className="flex gap-2 items-start text-xs text-[#bac9cd]">
                            <span className="text-primary text-[10px] mt-1">✦</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-[#1d2022]/10 border border-dashed border-white/5 rounded-2xl p-12 text-center text-xs text-on-surface-variant py-20">
                Selecione um ativo na esquerda para carregar logs antivírus e laudos detalhados.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
