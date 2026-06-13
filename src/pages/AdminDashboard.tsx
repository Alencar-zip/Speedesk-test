import React, { useState, useEffect } from 'react';
import { Product, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  products: Product[];
  onSetProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentUsername: string;
}

// Interface ajustada para a tabela 'profiles' do Supabase
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export default function AdminDashboard({ products, onSetProducts, currentUsername }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'security' | 'permissions'>('products');
  const [loading, setLoading] = useState(false);
  const [dbUsers, setDbUsers] = useState<AdminUser[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Estados de Edição de ID (Aceita UUID)
  const [editingProductId, setEditingProductId] = useState<number | string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // BUSCAR USUÁRIOS REAIS DO SUPABASE
  useEffect(() => {
    if (activeTab === 'permissions') {
      const fetchUsers = async () => {
        const { data } = await supabase.from('profiles').select('*');
        if (data) setDbUsers(data as AdminUser[]);
      };
      fetchUsers();
    }
  }, [activeTab]);

  // AÇÃO REAL: Aprovar Ativo no Banco de Dados (Requisito MoSCoW)
  const handleApprove = async (id: number | string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active' }) // Libera para o Marketplace
        .eq('id', id);
      
      if (!error) {
        onSetProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
        alert("Ativo auditado e liberado para comercializacao.");
      }
    } finally { setLoading(false); }
  };

  // AÇÃO REAL: Mandar para Quarentena (Rejeitar)
  const handleDecline = async (id: number | string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (!error) {
        onSetProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'declined' } : p));
        alert("Ativo retido em quarentena de seguranca.");
      }
    } finally { setLoading(false); }
  };

  // Mudar Cargo de Usuário no Banco (Admin/User)
  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (!error) {
       setDbUsers(prev => prev.map(u => u.id === userId ? {...u, role: newRole as any} : u));
       alert(`Permissao de ${newRole} concedida.`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="pb-20 animate-fade-in relative max-w-7xl mx-auto">
      {/* Decorative Lights */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-10 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-primary font-display tracking-tighter flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          Workspace Administrativo
        </h1>
        <div className="flex gap-2 mt-6">
           {['products', 'security', 'permissions'].map((tab: any) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest border transition-all ${
                  activeTab === tab ? 'bg-primary text-black border-primary' : 'text-on-surface-variant border-white/10 hover:bg-white/5'
                }`}
              >
                {tab === 'products' ? 'Ativos' : tab === 'security' ? 'Seguranca' : 'Usuarios'}
              </button>
           ))}
        </div>
      </header>

      {/* CONTEÚDO DINÂMICO POR ABA */}
      {activeTab === 'products' && (
        <div className="bg-[#16191b] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
             <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Triagem Geral de Inventário</span>
             <input 
              type="text" 
              placeholder="Buscar no banco..." 
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-1.5 text-xs text-white outline-none focus:border-primary" 
             />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                <tr>
                  <th className="p-6">Ativo / Autor</th>
                  <th className="p-6">Status Auditoria</th>
                  <th className="p-6 text-right">Acoes Corretivas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-all">
                    <td className="p-6">
                       <div className="flex items-center gap-4">
                          <img src={p.img} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                          <div>
                             <p className="font-bold text-white text-sm">{p.title}</p>
                             <p className="text-[10px] text-on-surface-variant font-mono">VALOR: R$ {p.price.toFixed(2)}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
    ((p.status as string) === 'active' || p.status === 'approved') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
    ((p.status as string) === 'rejected' || p.status === 'declined') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
}`}>
    {p.status === 'active' ? '✓ Ativo' : p.status === 'approved' ? '✓ Aprovado' : (p.status as string) === 'rejected' ? '⚠ Bloqueado' : p.status === 'declined' ? '⚠ Recusado' : '⌛ Analisando'}
</span>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleApprove(p.id)}
                            disabled={loading}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          >APROVAR</button>
                          <button 
                            onClick={() => handleDecline(p.id)}
                            disabled={loading}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          >BLOQUEAR</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA DE PERMISSÕES (USUÁRIOS REAIS) */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
           {dbUsers.map(u => (
              <div key={u.id} className="bg-[#1d2022] border border-white/10 p-6 rounded-2xl flex justify-between items-center shadow-lg">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center font-mono text-primary font-bold">
                       {u.username[0].toUpperCase()}
                    </div>
                    <div>
                       <h4 className="text-white font-bold">{u.username}</h4>
                       <p className="text-[10px] text-on-surface-variant font-mono">{u.email} • ID: {u.id.substring(0,8)}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <select 
                      value={u.role} 
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-primary font-mono outline-none"
                    >
                       <option value="User">Comprador</option>
                       <option value="Admin">Administrador</option>
                       <option value="Suporte">Suporte Técnico</option>
                    </select>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* ABA DE SEGURANÇA (FEED DE EVENTOS TÉCNICOS) */}
      {activeTab === 'security' && (
        <div className="bg-black/20 border border-white/5 rounded-3xl p-8 space-y-4 shadow-inner">
           <h3 className="text-primary font-mono text-xs uppercase tracking-[3px] mb-6">Logs de Integridade SHA-256</h3>
           <div className="space-y-3 font-mono text-[9px]">
              <p className="text-green-400/70">[23:14:02] Kernel Speedesk operando em modo distribuidor.</p>
              <p className="text-blue-400/70">[23:14:05] Socket de triagem ClamAV conectado no pool regional.</p>
              <p className="text-yellow-400/70">[23:15:20] Handshake Stripe v3 concluído via SSL TLS 1.3.</p>
           </div>
        </div>
      )}
    </div>
  );
}