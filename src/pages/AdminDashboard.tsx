import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface AdminDashboardProps {
  products: Product[];
  onSetProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentUsername: string;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Moderador' | 'Criador' | 'Comprador' | 'Suporte';
  verified: boolean;
  canPublishWithoutScan: boolean;
  withdrawsUnlocked: boolean;
  complianceAuditing: boolean;
  avatar: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  category: 'malware' | 'auth' | 'system' | 'admin' | 'financial';
  severity: 'info' | 'success' | 'warning' | 'error';
  message: string;
  target?: string;
  operator: string;
}

export default function AdminDashboard({ products, onSetProducts, currentUsername }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'security' | 'permissions'>('products');
  
  // Clean, high density search states
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [logCategoryFilter, setLogCategoryFilter] = useState<'all' | 'malware' | 'auth' | 'system' | 'admin' | 'financial'>('all');

  // Inline editing state for product details
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // 1. Interactive User Permissions State (Persisted in LocalStorage)
  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('speedesk_admin_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return [
      {
        id: 'USR-001',
        username: 'ProTrader99',
        email: 'alex.trader@speedesk.io',
        role: 'Criador',
        verified: true,
        canPublishWithoutScan: false,
        withdrawsUnlocked: true,
        complianceAuditing: false,
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgC4uQXopo7y3MwccZzzte0cJVY3c4i1Bq6BObMcuA_mP2K0EEb2utB_6F5w1qNJ7U6fp6qwd4EwLKE_kRLIwgh0gey7SEZe93Tg8DgwZxW4fMtnh1LClgZZ2cjciWIaKwXlU4M-4Yr8v3dZngtNqijVrz_lHZE8vJyVGVqtAHvB45NG270FvzQMWTjYTumWNygdX9h-da1wVaulBzv1kbfR1o_Nok0YzizEgcp1I66JwWyoQrG0p8GxaKC5X1QGe98a-96FHjuA"
      },
      {
        id: 'USR-002',
        username: 'admin',
        email: 'admin@speedesk.io',
        role: 'Admin',
        verified: true,
        canPublishWithoutScan: true,
        withdrawsUnlocked: true,
        complianceAuditing: true,
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpGHH305G9dKCQllWnZ0niT9Q-xI5VVdBvla0H89bGML1OM7tVjKC364MZrDgIsEFJxEr-jG4SYaOGYcJQ4lDXkTgYqzRM9cDJMj8g7wNas_9809VTtg-IusjWAd1vb1Y_ytGf3udNQABG_dABtoSFyOBx3u2Y5bSDamGRIrAKqmvfPBltmDsAU3lVX4NvYpIU0-FJLGEuuJcS_JN7vHhg3-b5iJezDDU3sInlXdEnH1-lMv-YCWgxyaFrCz-gMPeX38-DP_RccQ"
      },
      {
        id: 'USR-003',
        username: 'suporte',
        email: 'suporte@speedesk.io',
        role: 'Suporte',
        verified: true,
        canPublishWithoutScan: true,
        withdrawsUnlocked: true,
        complianceAuditing: true,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256"
      },
      {
        id: 'USR-004',
        username: 'Arthur K.',
        email: 'arthur.compliance@speedesk.io',
        role: 'Moderador',
        verified: true,
        canPublishWithoutScan: true,
        withdrawsUnlocked: true,
        complianceAuditing: true,
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqSDtqw3mLx2D7OFa1K_aJtvLyKwcOD4rFdwAF4l5myLeX4EDRWrz8bwzu7CG6UZ5CNT0DAc34WdXJPrAl7qD7H_ViT830SKw_beNDhhdYIw5MIpJZCC5P6UWKGjT5CGH0UqDdzHB-at9DUA18ccYWcX7xjtJLUIM4Kzzi0EPJZOo-okuy3juS98-g84-2i61eTCvAotCuM3VyEnHWe1mZXmLJDDI5Q_5KzcnrcRDsVmz8eRCIPAIQncQV02H03lj9MYdsk17kg"
      },
      {
        id: 'USR-005',
        username: 'Gustavo Alencar',
        email: 'guto99@gmail.com',
        role: 'Comprador',
        verified: false,
        canPublishWithoutScan: false,
        withdrawsUnlocked: false,
        complianceAuditing: false,
        avatar: ""
      }
    ];
  });

  // Save users state
  useEffect(() => {
    localStorage.setItem('speedesk_admin_users', JSON.stringify(users));
  }, [users]);

  // 2. Interactive Security Logs State (Persisted in LocalStorage)
  const [logs, setLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem('speedesk_security_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    const rightNow = new Date();
    return [
      {
        id: 'LOG-7091',
        timestamp: new Date(rightNow.getTime() - 4000).toLocaleString('pt-BR'),
        category: 'admin',
        severity: 'success',
        message: 'Acesso ao módulo de administração concedido',
        target: 'Configuração Geral do Sistema',
        operator: currentUsername
      },
      {
        id: 'LOG-6241',
        timestamp: new Date(rightNow.getTime() - 25000).toLocaleString('pt-BR'),
        category: 'malware',
        severity: 'info',
        message: 'Varredura automática por IA detectou integridade zero-threat em arquivo',
        target: 'Quantum Pitch Deck.pptx',
        operator: 'IA Gemini Scanner'
      },
      {
        id: 'LOG-5512',
        timestamp: new Date(rightNow.getTime() - 120000).toLocaleString('pt-BR'),
        category: 'financial',
        severity: 'warning',
        message: 'Aviso de transação em lote pendente de auditoria judicial',
        target: 'Saque de R$ 1.200,00',
        operator: 'Speedesk Fiscal'
      },
      {
        id: 'LOG-4122',
        timestamp: new Date(rightNow.getTime() - 360000).toLocaleString('pt-BR'),
        category: 'auth',
        severity: 'success',
        message: 'Token JWT renovado com sucesso (IP 192.168.1.55)',
        target: currentUsername,
        operator: 'OAuth Security Gateway'
      },
      {
        id: 'LOG-3301',
        timestamp: new Date(rightNow.getTime() - 720000).toLocaleString('pt-BR'),
        category: 'malware',
        severity: 'error',
        message: 'Ameaça em potencial de Injeção Malware / Trojan simulada bloqueada',
        target: 'Shellscript_Malicioso_V2.sh',
        operator: 'IA Gemini Sandbox'
      }
    ];
  });

  // Save logs state
  useEffect(() => {
    localStorage.setItem('speedesk_security_logs', JSON.stringify(logs));
  }, [logs]);

  // Push new log helper
  const addLog = (message: string, category: SecurityLog['category'], severity: SecurityLog['severity'], target?: string) => {
    const newLog: SecurityLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      category,
      severity,
      message,
      target: target || 'Sistema Autônomo',
      operator: currentUsername
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Administrative Actions - Products Page
  const hApproveProduct = (id: number, title: string) => {
    onSetProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    addLog(`Status do ativo alterado para APROVADO`, 'admin', 'success', title);
  };

  const hDeclineProduct = (id: number, title: string) => {
    onSetProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'declined' } : p));
    addLog(`Status do ativo alterado para RECUSADO (Bloqueado/Quarentena)`, 'malware', 'error', title);
  };

  const hResetVerification = (id: number, title: string) => {
    onSetProducts(prev => prev.map(p => p.id === id ? { 
      ...p, 
      status: 'analyzing', 
      scanLogs: [
        { time: new Date().toLocaleTimeString('pt-BR'), message: 'Análise de integridade reiniciada remotamente por Administrador.', type: 'info' }
      ] 
    } : p));
    addLog(`Análise de integridade de arquivo reiniciada por auditor`, 'system', 'info', title);
  };

  const hDeleteProduct = (id: number, title: string) => {
    onSetProducts(prev => prev.filter(p => p.id !== id));
    addLog(`Ativo do marketplace excluído definitivamente da plataforma`, 'admin', 'warning', title);
  };

  const handleStartEdit = (p: Product) => {
    setEditingProductId(p.id);
    setEditTitle(p.title);
    setEditPrice(p.price.toString());
    setEditCategory(p.category);
  };

  const handleSaveEdit = (id: number) => {
    const numericPrice = parseFloat(editPrice);
    if (!editTitle.trim() || isNaN(numericPrice)) return;

    onSetProducts(prev => prev.map(p => p.id === id ? {
      ...p,
      title: editTitle,
      price: numericPrice,
      category: editCategory
    } : p));

    addLog(`Metadados do ativo alterados manualmente pelo admin`, 'admin', 'success', editTitle);
    setEditingProductId(null);
  };

  // Simulations for Security tab
  const handleSimulateAttack = () => {
    const payloads = [
      'Injeção CSS maliciosa detectada na descrição do perfil do usuário Alex',
      'Script de mineração WebGL desativado preventivamente no Sandbox de IA',
      'Varredura antivírus detectou arquivo ZIP multipart com extensão executável oculta (.exe.png)',
      'Detecção heurística de phishing usando spoofing de layout de banco de dados',
      'IP de acesso suspeito colocou credencial regional em suspensão temporária'
    ];
    const category: SecurityLog['category'][] = ['malware', 'system', 'malware', 'auth', 'auth'];
    const severity: SecurityLog['severity'][] = ['error', 'warning', 'error', 'warning', 'error'];
    
    const index = Math.floor(Math.random() * payloads.length);
    addLog(payloads[index], category[index], severity[index], 'Simulador de Intrusão');
  };

  const handleRunSystemVerify = () => {
    addLog('Auditoria completa de servidores e verificação de hash SHA256 concluída com sucesso', 'system', 'success', 'Infraestrutura Cloud Run');
  };

  // Toggle user state helper
  const handleToggleUserVerify = (userId: string, username: string, currentVal: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: !currentVal } : u));
    addLog(`Selo de Verificação do usuário alterado para ${!currentVal ? 'ATIVADO' : 'DESATIVADO'}`, 'admin', 'info', username);
  };

  const handleToggleUserPermission = (userId: string, username: string, field: keyof AdminUser) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newVal = !u[field];
        return { ...u, [field]: newVal };
      }
      return u;
    }));
    addLog(`Permissão '${field}' alterada para o usuário`, 'admin', 'warning', username);
  };

  const handleRoleChange = (userId: string, username: string, newRole: AdminUser['role']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    addLog(`Função do usuário alterada para ${newRole}`, 'admin', 'success', username);
  };

  // Filter lists based on widgets inputs
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.creator.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(l => {
    const matchesSeverity = logFilter === 'all' || l.severity === logFilter;
    const matchesCategory = logCategoryFilter === 'all' || l.category === logCategoryFilter;
    return matchesSeverity && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Absolute Decorative Blur Elements */}
      <div className="absolute top-10 right-20 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-black text-primary font-display tracking-tighter mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>admin_panel_settings</span>
            Painel Geral do Administrador
          </h1>
          <p className="text-xs text-[#8b9293] font-medium leading-relaxed">
            Painel completo para controle de produtos, visualização de logs de segurança em tempo real e de controle de permissões.
          </p>
        </div>

        {/* Dynamic Navigation/Tabs Header */}
        <div className="flex bg-[#191c1e] p-1 rounded-xl border border-white/5 self-start">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all uppercase cursor-pointer ${
              activeTab === 'products' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Ativos ({products.length})
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all uppercase cursor-pointer ${
              activeTab === 'security' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">gshield</span>
            Logs de Segurança ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all uppercase cursor-pointer ${
              activeTab === 'permissions' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            Permissões ({users.length})
          </button>
        </div>
      </header>

      {/* QUICK STATS WIDGET GRID (Non-glassy, solid backgrounds) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#16191b] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#bac9cd]/60 uppercase font-bold tracking-widest block">Saneamento Técnico</span>
            <span className="text-xl font-black font-display text-white mt-1">100% Ok</span>
          </div>
          <p className="text-[9px] font-mono text-primary mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Servidores Auditados
          </p>
        </div>

        <div className="bg-[#16191b] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#bac9cd]/60 uppercase font-bold tracking-widest block">Ativos Não Aprovados</span>
            <span className={`text-xl font-black font-display mt-1 ${products.filter(p => p.status === 'analyzing').length > 0 ? 'text-yellow-400' : 'text-white'}`}>
              {products.filter(p => p.status === 'analyzing').length} Uni.
            </span>
          </div>
          <p className="text-[9px] font-mono text-[#bac9cd]/40 mt-1">Aguardando IA / Decisões</p>
        </div>

        <div className="bg-[#16191b] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#bac9cd]/60 uppercase font-bold tracking-widest block">Ativos Bloqueados</span>
            <span className="text-xl font-black font-display text-red-400 mt-1">
              {products.filter(p => p.status === 'declined').length} Bloqueios
            </span>
          </div>
          <p className="text-[9px] font-mono text-red-400/60 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">warning</span> Quarentena ativa
          </p>
        </div>

        <div className="bg-[#16191b] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#bac9cd]/60 uppercase font-bold tracking-widest block">Usuários VIPs</span>
            <span className="text-xl font-black font-display text-white mt-1">
              {users.filter(u => u.verified).length} {users.filter(u => u.verified).length === 1 ? 'membro' : 'membros'}
            </span>
          </div>
          <p className="text-[9px] font-mono text-[#bac9cd]/40 mt-1">Com selo verificado ativo</p>
        </div>
      </section>

      {/* ==================== TAB 1: MANAGE PRODUCTS ==================== */}
      {activeTab === 'products' && (
        <div className="bg-[#16191b] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">box</span>
                Catálogo Geral de Ativos Digitais
              </h2>
              <p className="text-[10px] text-[#8b9293]">Gerencie, altere valores ou altere permissões de auditoria contra malwares dos arquivos disponibilizados.</p>
            </div>

            {/* In-place search */}
            <div className="bg-[#101415] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 max-w-xs w-full">
              <span className="material-symbols-outlined text-sm text-[#bac9cd]/60">search</span>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Filtrar por nome, autor ou categoria..."
                className="bg-transparent border-none text-xs text-white outline-none w-full placeholder:text-[#bac9cd]/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-on-surface-variant font-mono">
              <thead>
                <tr className="border-b border-white/10 text-white pb-3 bg-white/5 rounded-t-xl">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Ativo</th>
                  <th className="py-3.5 px-2 font-bold uppercase tracking-wider text-[10px]">Preço</th>
                  <th className="py-3.5 px-2 font-bold uppercase tracking-wider text-[10px]">Categoria / Formato</th>
                  <th className="py-3.5 px-2 font-bold uppercase tracking-wider text-[10px]">Auditoria</th>
                  <th className="py-3.5 px-4 text-center font-bold uppercase tracking-wider text-[10px] w-[350px]">Ações do Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl mb-1 text-[#bac9cd]/20">search_off</span>
                      <p className="text-xs">Nenhum ativo corresponde ao termo pesquisado.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isEditing = editingProductId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-white/[2%] transition-colors duration-150">
                        {/* Name column */}
                        <td className="py-4 px-4 font-sans font-medium text-[#e0e3e5]">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-[#101415] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none w-full"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <img src={p.img} alt={p.title} className="w-9 h-9 object-cover rounded-lg border border-white/10 shrink-0" referrerPolicy="no-referrer" />
                              <div className="truncate">
                                <p className="font-bold text-white truncate max-w-[200px]">{p.title}</p>
                                <p className="text-[10px] text-[#bac9cd]/50 truncate">Por: {p.creator}</p>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Price column */}
                        <td className="py-4 px-2 font-mono font-bold text-white">
                          {isEditing ? (
                            <div className="flex items-center gap-1 bg-[#101415] border border-white/10 rounded-lg px-2 py-1 max-w-[100px]">
                              <span className="text-[10px] text-[#8b9293]">R$</span>
                              <input
                                type="number"
                                step="10"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="bg-transparent border-none text-xs text-white outline-none w-full"
                              />
                            </div>
                          ) : (
                            `R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          )}
                        </td>

                        {/* Category & Format */}
                        <td className="py-4 px-2 text-on-surface-variant font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="bg-[#101415] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none w-[120px]"
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-white opacity-90">{p.category}</span>
                              <span className="text-[9px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 mt-1 self-start font-extrabold text-primary truncate max-w-[80px]">{p.format}</span>
                            </div>
                          )}
                        </td>

                        {/* Status Checker */}
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 text-[9px] rounded-lg border font-mono font-extrabold uppercase ${
                            p.status === 'approved' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : p.status === 'declined'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-[#c0c1ff]/15 text-[#c0c1ff] border-[#c0c1ff]/20 animate-pulse'
                          }`}>
                            {p.status === 'approved' ? '✓ Aprovado' : p.status === 'declined' ? '⚠ Quarentena' : '⌛ Analisando'}
                          </span>
                        </td>

                        {/* Custom actions column with full control */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(p.id)}
                                  className="bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/25 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-bold transition-all cursor-pointer"
                                  title="Salvar alterações"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setEditingProductId(null)}
                                  className="bg-white/5 border border-white/10 text-white hover:bg-white/10 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer"
                                  title="Cancelar edição"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(p)}
                                  className="bg-white/5 hover:bg-white/10 text-[#bac9cd] hover:text-white border border-white/10 p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                  title="Editar Produto"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>

                                <button
                                  onClick={() => hResetVerification(p.id, p.title)}
                                  className="bg-primary/5 hover:bg-primary/20 text-primary border border-primary/20 p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                  title="Reiniciar Análise IA"
                                >
                                  <span className="material-symbols-outlined text-sm">replay_circle_filled</span>
                                </button>

                                {p.status !== 'approved' && (
                                  <button
                                    onClick={() => hApproveProduct(p.id, p.title)}
                                    className="bg-green-500/10 hover:bg-green-500/25 text-green-400 border border-green-500/20 px-2 py-1 rounded-lg text-[9px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1"
                                    title="Aprovar manualmente"
                                  >
                                    <span className="material-symbols-outlined text-[12px] font-bold">check</span> Aprovar
                                  </button>
                                )}

                                {p.status !== 'declined' && (
                                  <button
                                    onClick={() => hDeclineProduct(p.id, p.title)}
                                    className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-2 py-1 rounded-lg text-[9px] font-mono tracking-wider font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1"
                                    title="Quarentena"
                                  >
                                    <span className="material-symbols-outlined text-[12px] font-bold">block</span> Bloquear
                                  </button>
                                )}

                                <button
                                  onClick={() => hDeleteProduct(p.id, p.title)}
                                  className="bg-red-500/10 hover:bg-red-500/35 text-red-500 border border-red-500/10 p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                  title="Remover definitivamente"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: GENERAL SECURITY LOGS ==================== */}
      {activeTab === 'security' && (
        <div className="bg-[#16191b] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">gshield</span>
                Mural de Integridade e Logs de Segurança
              </h2>
              <p className="text-[10px] text-[#8b9293]">Fluxo heurístico unificado em tempo real coletando avisos operacionais, injeções, logins e autenticações.</p>
            </div>

            {/* Simulated Tools buttons */}
            <div className="flex items-center gap-2 self-start">
              <button
                onClick={handleSimulateAttack}
                className="bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 text-[10px] font-mono font-bold px-3 py-2 rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">warning</span>
                Simular Invasão
              </button>

              <button
                onClick={handleRunSystemVerify}
                className="bg-primary/10 text-primary hover:bg-primary/25 border border-primary/25 text-[10px] font-mono font-bold px-3 py-2 rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">security_update_good</span>
                Auditar Sistemas
              </button>
            </div>
          </div>

          {/* Integrated Filtering layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#101415] p-3 rounded-2xl border border-white/5 text-xs">
            {/* Filter by severity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-[#bac9cd]/50 uppercase tracking-widest font-mono">Filtrar por Gravidade dos Logs</label>
              <div className="flex flex-wrap gap-1">
                {(['all', 'info', 'success', 'warning', 'error'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setLogFilter(sev)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-extrabold border transition-all cursor-pointer ${
                      logFilter === sev
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'bg-[#16191b] border-white/5 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {sev === 'all' ? 'Todos' : sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by category role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-[#bac9cd]/50 uppercase tracking-widest font-mono">Categoria de Monitoramento</label>
              <div className="flex flex-wrap gap-1">
                {(['all', 'malware', 'auth', 'system', 'admin', 'financial'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLogCategoryFilter(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-mono uppercase font-bold border transition-all cursor-pointer ${
                      logCategoryFilter === cat
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'bg-[#16191b] border-white/5 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Todas' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Core Logs Stream List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-1 text-[#bac9cd]/20">policy</span>
                <p className="text-xs">Nenhum evento corresponde aos filtros atuais.</p>
              </div>
            ) : (
              filteredLogs.map((l) => {
                const badgeColor = 
                  l.severity === 'success' ? 'bg-green-400 text-green-950 font-black' :
                  l.severity === 'warning' ? 'bg-yellow-400 text-yellow-950 font-black' :
                  l.severity === 'error' ? 'bg-red-400 text-white font-black animate-pulse' :
                  'bg-primary/30 text-white font-bold';

                const catIcon = 
                  l.category === 'malware' ? 'pest_control' :
                  l.category === 'auth' ? 'key' :
                  l.category === 'financial' ? 'payments' :
                  l.category === 'admin' ? 'support_agent' :
                  'dns';

                return (
                  <div key={l.id} className="bg-[#101415] border border-white/5 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-start md:items-center gap-2.5 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-wider uppercase inline-block shrink-0 ${badgeColor}`}>
                        {l.severity}
                      </span>
                      <span className="material-symbols-outlined text-[#bac9cd]/30 text-sm shrink-0 select-none" title={`Categoria: ${l.category}`}>
                        {catIcon}
                      </span>
                      <div className="truncate">
                        <p className="text-white font-semibold leading-snug">{l.message}</p>
                        <p className="text-[9px] text-[#bac9cd]/40 mt-0.5">
                          Alvo: <span className="text-white/60">{l.target}</span> • Operador: <span className="text-primary/60">{l.operator}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 text-[10px] text-on-surface-variant self-end md:self-auto border-t md:border-t-0 border-white/5 pt-2 md:pt-0 w-full md:w-auto">
                      <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase text-[9px]">ID: {l.id}</span>
                      <span className="text-on-surface-variant font-mono">{l.timestamp}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: USER PERMISSIONS ==================== */}
      {activeTab === 'permissions' && (
        <div className="bg-[#16191b] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
                Gerenciamento de Matriz de Usuários & Níveis de Acesso
              </h2>
              <p className="text-[10px] text-[#8b9293]">Aprove credenciais, conceda selos verificados e gerencie o nível de cada perfil.</p>
            </div>

            {/* In-place search users */}
            <div className="bg-[#101415] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 max-w-xs w-full">
              <span className="material-symbols-outlined text-sm text-[#bac9cd]/60">person_search</span>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Filtrar por nome ou e-mail..."
                className="bg-transparent border-none text-xs text-white outline-none w-full placeholder:text-[#bac9cd]/30"
              />
            </div>
          </div>

          {/* User management list */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-1 text-[#bac9cd]/20">person_off</span>
                <p className="text-xs">Nenhum criador ou cliente condizente com a pesquisa.</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="bg-[#101415] border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 font-mono text-xs">
                  
                  {/* User credentials identifier */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-[42px] h-[42px] rounded-xl overflow-hidden bg-[#16191b] border border-white/5 flex items-center justify-center shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="material-symbols-outlined text-xl text-[#8b9293]">person</span>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold font-sans text-xs">{u.username}</span>
                        {u.verified && (
                          <span className="material-symbols-outlined text-primary text-[15px] select-none" style={{ fontVariationSettings: "'FILL' 1" }} title="Usuário Ativo Verificado">
                            verified
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#bac9cd]/40 mt-0.5">{u.email}</p>
                      <p className="text-[9px] text-[#bac9cd]/60 bg-white/5 border border-white/5 rounded px-1.5 py-0.5 mt-1 inline-block">ID: {u.id}</p>
                    </div>
                  </div>

                  {/* Role configuration selectors */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase text-[#bac9cd]/40 font-bold">Nível / Cargo</span>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, u.username, e.target.value as AdminUser['role'])}
                        className="bg-[#16191b] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary font-mono cursor-pointer"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Moderador">Moderador</option>
                        <option value="Criador">Criador</option>
                        <option value="Comprador">Comprador</option>
                        <option value="Suporte">Suporte</option>
                      </select>
                    </div>

                    {/* Permissions checklist matrix */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase text-[#bac9cd]/40 font-bold">Verificado</span>
                      <button
                        onClick={() => handleToggleUserVerify(u.id, u.username, u.verified)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          u.verified 
                            ? 'bg-primary/20 text-primary border-primary/30' 
                            : 'bg-[#16191b]/50 border-white/5 text-[#bac9cd]/40 hover:text-white'
                        }`}
                      >
                        {u.verified ? 'Verificado' : 'Não Verificado'}
                      </button>
                    </div>
                  </div>

                  {/* Advanced toggle constraints flags */}
                  <div className="grid grid-cols-2 lg:flex items-center gap-2 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                    
                    <button
                      onClick={() => handleToggleUserPermission(u.id, u.username, 'withdrawsUnlocked')}
                      className={`flex-1 lg:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-xl border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                        u.withdrawsUnlocked
                          ? 'bg-green-500/15 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                      title="Permitir movimentação financeira e transferências via Pix instantâneo"
                    >
                      <span className="material-symbols-outlined text-[13px]">currency_exchange</span>
                      Saque OK
                    </button>

                    <button
                      onClick={() => handleToggleUserPermission(u.id, u.username, 'complianceAuditing')}
                      className={`col-span-2 lg:col-span-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl border text-[9px] font-bold uppercase transition-all cursor-pointer ${
                        u.complianceAuditing
                          ? 'bg-[#c0c1ff]/15 text-[#c0c1ff] border-[#c0c1ff]/20'
                          : 'bg-[#16191b] border-white/5 text-[#bac9cd]/50 hover:bg-[#1f2224]'
                      }`}
                      title="Permitir auditoria de conformidade técnica e gerenciamento de arquivos quarentenados"
                    >
                      <span className="material-symbols-outlined text-[13px]">gavel</span>
                      Audit Desk
                    </button>

                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Helpful Hint banner */}
      <footer className="bg-gradient-to-br from-[#16191b] to-[#101415] border border-white/5 rounded-2xl p-5 text-xs text-on-surface-variant font-body">
        <h4 className="font-bold text-white mb-1.5 uppercase font-display text-[11px] tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-sm">info</span>
          Diretrizes do Operador Técnico Speedesk
        </h4>
        <p className="leading-relaxed">
          Toda e qualquer decisão do operador altera os hashes de transações e regras de faturamento nos componentes do Sandbox e na carteira no mesmo instante. Os logs de auditoria de segurança gerados neste painel não são retroativos e são imutáveis após seu registro, visando manter a integridade fiscal da rede.
        </p>
      </footer>

    </div>
  );
}
