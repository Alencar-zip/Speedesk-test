import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

interface WalletProps {
  balance: number;
  transactions: Transaction[];
  onAddFunds: (amount: number) => void;
  onWithdrawFunds: (amount: number) => boolean;
  onAddTransaction: (transaction: Transaction) => void;
}

export default function Wallet({ balance, transactions }: WalletProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Estados dos Modais
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [pixKeyValue, setPixKeyValue] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // ITEM 3 & 4 INTEGRADO: Adicionar fundos via Stripe real
  const handleRealDeposit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    // Puxa o link do Render da Vercel
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242';

    const response = await fetch(`${API_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: session?.user.id, 
        priceAmount: Number(depositAmount), // Enviamos o VALOR agora
        mode: 'payment'
      })
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Servidor nao devolveu link de pagamento.");
    }
  } catch (err) {
    alert("Erro ao conectar com o motor de pagamentos.");
  } finally {
    setLoading(false);
  }
};
  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (amount > balance) return alert("Saldo insuficiente.");
    if (!pixKeyValue) return alert("Informe a chave Pix.");

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Grava a solicitação de saque no banco para o Admin processar
      const { error } = await supabase.from('transactions').insert([{
        buyer_id: user?.id,
        type: 'Saque',
        source: `Saque solicitado para Pix: ${pixKeyValue}`,
        amount: -amount,
        status: 'pending' // Fica pendente até o suporte aprovar
      }]);

      if (error) throw error;
      
      alert("Solicitacao enviada. O valor sera liquidado em ate 5 minutos.");
      setShowWithdrawModal(false);
    } catch (err) {
      alert("Falha ao registrar saque.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <header className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tighter">Carteira Digital</h2>
          <p className="text-on-surface-variant text-sm mt-1">Sua carteira digital. Retire, saque e monitore suas transações.</p>
        </div>
        <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase">Mainnet Online</span>
        </div>
      </header>

      {/* Grid de Saldos Reais */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <div className="md:col-span-7 bg-[#16191b] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[11px] font-mono text-on-surface-variant uppercase font-bold tracking-widest mb-2">Saldo Sacável</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-2xl text-primary font-mono">R$</span>
              <span className="text-5xl font-black text-white font-display tracking-tight">
                {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowWithdrawModal(true)} className="bg-primary text-black font-black px-8 py-3 rounded-xl text-xs uppercase shadow-lg hover:scale-102 transition-all">Solicitar Saque</button>
              <button onClick={() => setShowDepositModal(true)} className="bg-white/5 text-white border border-white/10 px-8 py-3 rounded-xl text-xs uppercase hover:bg-white/10 transition-all">Adicionar Pix</button>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-[#16191b] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-mono text-on-surface-variant uppercase font-bold tracking-widest">Saldo em Quarentena</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl text-on-surface-variant font-mono font-bold">R$</span>
              <span className="text-3xl font-bold text-on-surface-variant/70 tracking-tighter">0,00</span>
            </div>
          </div>
          <div className="text-[10px] text-on-surface-variant leading-relaxed p-4 bg-[#101415] rounded-2xl border border-white/5">
             As vendas de ativos tecnicos ficam retidas por 168h para garantir a janela de seguranca de 48h ao comprador.
          </div>
        </div>
      </div>

      {/* Tabela de Auditoria e Logística */}
      <section className="bg-[#131618] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] font-mono text-on-surface-variant uppercase">
            <tr>
              <th className="p-6">Referencia</th>
              <th className="p-6">Origem / Destino</th>
              <th className="p-6 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                  <p className="text-white font-bold text-xs">{tx.id}</p>
                  <span className="text-[9px] font-mono text-on-surface-variant uppercase">{tx.date}</span>
                </td>
                <td className="p-6">
                  <p className="text-white text-xs">{tx.source}</p>
                  <span className="text-[9px] font-mono text-primary uppercase">{tx.type}</span>
                </td>
                <td className={`p-6 text-right font-mono font-black ${tx.status === 'success' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {tx.amount > 0 ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="p-20 text-center text-on-surface-variant text-xs font-mono">Sem operacoes registradas no ledger atual.</div>
        )}
      </section>

      {/* Modal Adicionar Pix (Integrado Stripe Checkout) */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#191c1e] border border-primary/30 rounded-3xl max-w-sm w-full p-8 shadow-2xl relative space-y-6">
             <button onClick={() => setShowDepositModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer"><span className="material-symbols-outlined">close</span></button>
             <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Recarga Speedesk</h3>
                <p className="text-xs text-on-surface-variant mt-1">O valor selecionado sera creditado via checkout seguro Stripe.</p>
             </div>
             <form onSubmit={handleRealDeposit} className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                   {['50', '100', '250', '500'].map(v => (
                      <button key={v} type="button" onClick={() => setDepositAmount(v)} className={`py-3 rounded-xl font-mono text-xs border ${depositAmount === v ? 'bg-primary text-black font-bold border-primary shadow-lg' : 'bg-[#101415] text-white border-white/5 hover:border-white/20'}`}>R$ {v}</button>
                   ))}
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl uppercase text-xs tracking-widest transition-all hover:scale-102">
                   {loading ? 'Inicializando gateway...' : 'Gerar Checkout Seguro'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}