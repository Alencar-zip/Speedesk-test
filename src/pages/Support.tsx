import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

interface SupportProps {
  products: Product[];
  username: string;
  userRole?: string;
}

export default function Support({ products, username, userRole }: SupportProps) {
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // Estados do Novo Ticket
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Carregar Tickets Reais do Usuário
  useEffect(() => {
    const fetchTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('support_tickets') // Certifique-se de criar esta tabela
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setActiveTickets(data);
    };
    fetchTickets();
  }, []);

  const handleOpenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user?.id,
          subject,
          description: message,
          product_id: selectedProductId || null,
          status: 'ai_triage', // Começa na triagem automatica
          user_name: username
        }]);

      if (error) throw error;

      alert("Solicitacao registrada na rede. O nucleo Speedesk retornara em breve.");
      setShowNewTicketModal(false);
      window.location.reload(); // Recarrega para mostrar o novo ticket
    } catch (err: any) {
      alert("Falha ao abrir chamado técnico: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary font-display tracking-tighter">Suporte Híbrido</h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Mediação de disputas técnicas e auditoria de ativos via IA e humanos.
          </p>
        </div>
        <button 
          onClick={() => setShowNewTicketModal(true)}
          className="bg-primary text-black font-black px-6 py-3 rounded-xl text-xs uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          Novo Chamado / Disputa
        </button>
      </header>

      {/* Grid de Informação de Segurança (Exigência PDF) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#1d2022] border border-white/5 p-6 rounded-2xl">
          <span className="text-primary material-symbols-outlined text-3xl mb-4">gavel</span>
          <h4 className="font-bold text-white text-xs uppercase mb-2">Janela de Disputa</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">Voce tem 48 horas uteis para contestar a integridade técnica de qualquer ativo baixado.</p>
        </div>
        <div className="bg-[#1d2022] border border-white/5 p-6 rounded-2xl">
          <span className="text-[#00e0ff] material-symbols-outlined text-3xl mb-4">robot_2</span>
          <h4 className="font-bold text-white text-xs uppercase mb-2">Triagem por IA</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">Todos os chamados passam por uma analise previa de log e IP para acelerar a resolucao.</p>
        </div>
        <div className="bg-[#1d2022] border border-white/5 p-6 rounded-2xl">
          <span className="text-green-400 material-symbols-outlined text-3xl mb-4">shield_check</span>
          <h4 className="font-bold text-white text-xs uppercase mb-2">Proteção Speedesk</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">O saldo do vendedor permanece retido até a finalização bem-sucedida do seu download.</p>
        </div>
      </div>

      {/* Lista de Chamados Ativos no Banco */}
      <section className="bg-[#16191b] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
           <h3 className="text-xs font-bold text-white uppercase tracking-widest">Seu Histórico de Auditorias</h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {activeTickets.length > 0 ? activeTickets.map(tk => (
            <div key={tk.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/[0.01] transition-all">
               <div>
                  <h4 className="text-white font-bold text-sm mb-1">{tk.subject}</h4>
                  <p className="text-[10px] text-on-surface-variant font-mono">PROTOCOLO: {tk.id} • DATA: {new Date(tk.created_at).toLocaleDateString()}</p>
               </div>
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  tk.status === 'ai_triage' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  tk.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  'bg-primary/10 text-primary border-primary/20'
               }`}>
                  {tk.status === 'ai_triage' ? 'Em Triagem IA' : tk.status === 'human_mediation' ? 'Mediação Humana' : 'Resolvido'}
               </span>
            </div>
          )) : (
            <div className="p-20 text-center text-on-surface-variant text-xs font-mono">Nenhum chamado de auditoria registrado no seu perfil.</div>
          )}
        </div>
      </section>

      {/* Modal Novo Ticket (Funcional) */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in backdrop-blur-md">
          <div className="bg-[#191c1e] border border-white/10 rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl relative">
             <button onClick={() => setShowNewTicketModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer"><span className="material-symbols-outlined">close</span></button>
             <h3 className="text-xl font-black text-white uppercase tracking-tighter">Novo Ticket de Segurança</h3>
             <form onSubmit={handleOpenTicket} className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Assunto do Chamado</label>
                   <input type="text" required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-primary" placeholder="Ex: Arquivo corrompido ou Chave invalida" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Vincular ao Produto (Opcional)</label>
                   <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
                      <option value="">Nenhum ativo selecionado</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Mensagem Técnica</label>
                   <textarea rows={4} required value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none resize-none" placeholder="Descreva o problema com o maior nivel de detalhes possivel para a auditoria..." />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-black font-black rounded-xl uppercase text-xs shadow-xl transition-all hover:scale-102">
                   {loading ? 'Sincronizando com a Central...' : 'Abrir Disputa / Ajuda'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}