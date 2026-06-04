import React, { useState } from 'react';
import { Transaction } from '../types';

interface WalletProps {
  balance: number;
  transactions: Transaction[];
  onAddFunds: (amount: number) => void;
  onWithdrawFunds: (amount: number) => boolean;
  onAddTransaction: (transaction: Transaction) => void;
}

export default function Wallet({ balance, transactions, onAddFunds, onWithdrawFunds, onAddTransaction }: WalletProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Deposit Modal State
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  // Withdraw Modal State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('1000');
  const [pixKeyType, setPixKeyType] = useState<string>('CPF');
  const [pixKeyValue, setPixKeyValue] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('NuBank');
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  const handleSimulatedDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido de depósito.');
      return;
    }

    setLoadingDeposit(true);
    setTimeout(() => {
      onAddFunds(amount);
      
      const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
      const formattedDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      const newTx: Transaction = {
        id: txId,
        date: formattedDate,
        type: 'Depósito',
        source: 'Depósito PIX Recebido',
        amount: amount,
        status: 'success'
      };

      onAddTransaction(newTx);
      setLoadingDeposit(false);
      setShowDepositModal(false);
      alert(`Depósito de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} creditado com sucesso!`);
    }, 1200);
  };

  const handleSimulatedWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, insira um valor válido para retirada.');
      return;
    }

    if (amount > balance) {
      alert('Saldo insuficiente na carteira para realizar este saque.');
      return;
    }

    if (!pixKeyValue.trim()) {
      alert('Por favor, informe a sua chave Pix.');
      return;
    }

    setLoadingWithdraw(true);
    setTimeout(() => {
      const success = onWithdrawFunds(amount);
      if (success) {
        const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        const formattedDate = new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const newTx: Transaction = {
          id: txId,
          date: formattedDate,
          type: 'Saque',
          source: `Saque para Pix (${selectedBank})`,
          amount: -amount,
          status: 'expense'
        };

        onAddTransaction(newTx);
        alert(`Saque de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} solicitado! Seu banco receberá o crédito em até 5 minutos.`);
      }
      setLoadingWithdraw(false);
      setShowWithdrawModal(false);
      setPixKeyValue('');
    }, 1500);
  };

  // Monthly stats helpers
  const totalExpense = Math.abs(transactions
    .filter(t => t.status === 'expense')
    .reduce((acc, t) => acc + t.amount, 0));

  const totalDeposited = transactions
    .filter(t => t.status === 'success')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in relative">
      
      {/* Background ambient light glowing effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Page Header */}
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tighter font-display">Carteira Digital</h2>
          <p className="text-[#bac9cd] text-sm mt-1">Gestão de custódia, quarentena e liquidação.</p>
        </div>
        <div className="px-4 py-2 bg-[#baf2ff]/5 border border-[#baf2ff]/20 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00e0ff] animate-pulse"></div>
          <span className="text-[10px] font-mono text-[#baf2ff] uppercase tracking-tighter">Rede Principal Ativa</span>
        </div>
      </div>

      {/* BALANCE BENTO GRID */}
      <div className="grid grid-cols-12 gap-6 mb-8 shrink-0">
        {/* DISPONIVEL CARD */}
        <div className="col-span-12 lg:col-span-7 bg-[#16191b] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[12rem] shadow-lg" id="immersive-wallet-card">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#baf2ff]/5 blur-[60px] rounded-full pointer-events-none"></div>
          <div>
            <p className="text-[11px] font-mono text-[#bac9cd] uppercase tracking-widest mb-2 font-bold">Saldo Sacável (Disponível)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-[#00e0ff] font-mono">R$</span>
              <span className="text-5xl font-bold text-white tracking-tighter font-display">
                {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="bg-[#00e0ff] text-[#00363f] font-bold px-8 py-3 rounded-xl text-xs uppercase shadow-[0_0_20px_rgba(0,224,255,0.3)] hover:scale-105 transition-all duration-300 cursor-pointer"
              id="wallet-withdraw-trigger-btn"
            >
              Solicitar Saque
            </button>
            <button 
              onClick={() => setShowDepositModal(true)}
              className="bg-white/5 text-white border border-white/10 px-6 py-3 rounded-xl text-xs uppercase hover:bg-white/10 cursor-pointer transition-all duration-300"
              id="wallet-deposit-trigger-btn"
            >
              Adicionar Pix
            </button>
          </div>
        </div>

        {/* BLOQUEADO / QUARENTENA CARD */}
        <div className="col-span-12 lg:col-span-5 bg-[#16191b] border border-white/5 rounded-3xl p-8 flex flex-col justify-between min-h-[12rem]">
          <div>
            <div className="flex justify-between items-center">
              <p className="text-[11px] font-mono text-[#bac9cd] uppercase tracking-widest mb-1 font-bold">Quarentena (7 dias)</p>
              <span className="material-symbols-outlined text-sm text-[#bac9cd]/50">lock_clock</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl text-[#bac9cd] font-mono">R$</span>
              <span className="text-3xl font-bold text-[#bac9cd] tracking-tighter font-display">350,00</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 mt-4">
            <p className="text-[10px] text-[#bac9cd] leading-tight font-medium">
              <span className="text-[#baf2ff] font-bold">Aviso:</span> Valores em quarentena são liberados após 168h se não houver contestação.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS & DISPUTE AREA */}
      <div className="bg-[#131618] border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-lg">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">Logística Digital & Auditoria</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-mono text-[#baf2ff] font-semibold">ULTIMAS OPERAÇÕES</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] font-mono text-[#bac9cd] uppercase tracking-widest bg-white/2">
              <tr className="border-b border-white/5">
                <th className="p-6">Data / Auditoria</th>
                <th className="p-6">Ativo Digital</th>
                <th className="p-6">Valor Bruto</th>
                <th className="p-6 text-right">Ações de Segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-body">
              {transactions.map((tx) => {
                // Deterministic IP based on transaction id
                const code1 = tx.id.charCodeAt(3) || 44;
                const code2 = tx.id.charCodeAt(4) || 32;
                const mockIp = `189.12.${(code1) % 254}.${(code2) % 254}`;
                const isSuccess = tx.status === 'success';

                return (
                  <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-6 font-mono text-[#bac9cd] text-xs leading-normal">
                      {tx.date}
                      <br/>
                      <span className="text-[9px] opacity-50">IP: {mockIp}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white leading-tight">{tx.source}</span>
                        <span className="text-[10px] text-[#baf2ff] font-mono mt-0.5">{tx.type} • ID: {tx.id}</span>
                      </div>
                    </td>
                    <td className={`p-6 font-mono text-sm font-bold ${isSuccess ? 'text-[#00e0ff]' : 'text-white'}`}>
                      {isSuccess ? '+' : '-'} R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-right">
                      {!isSuccess ? (
                        <button 
                          onClick={() => alert(`Contestação da transação ${tx.id} iniciada com sucesso. Nossa equipe de conformidade analisará o caso em até 24h.`)}
                          className="px-3 py-1.5 border border-[#ffb4ab]/30 text-[#ffb4ab] rounded-lg text-[10px] font-mono uppercase hover:bg-[#ffb4ab]/10 cursor-pointer transition-all duration-200"
                        >
                          Contestar (42h Restantes)
                        </button>
                      ) : (
                        <span className="text-[11px] text-green-400 font-bold uppercase tracking-wider inline-flex items-center gap-1 font-mono md:justify-end">
                          <span className="material-symbols-outlined text-sm align-middle">check_circle</span> Liquidado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <div className="text-center py-12 text-[#bac9cd]/50 font-body text-xs">
            Nenhuma transação anotada na blockchain local até o momento.
          </div>
        )}
      </div>

      {/* 1. Deposit Holographic Modal Dialog */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fade-in">
          <div className="bg-[#191c1e] border border-primary/20 rounded-3xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(0,224,255,0.15)] relative space-y-6">
            <button 
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer"
              title="Fechar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2 select-none" style={{fontVariationSettings: "'FILL' 1"}}>add_moderator</span>
              <h3 className="text-lg font-bold font-display text-white">Adicionar Fundos via Pix</h3>
              <p className="text-[11px] text-on-surface-variant mt-1">Gere uma cobrança Pix imediata para recarregar.</p>
            </div>

            <form onSubmit={handleSimulatedDeposit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Valor do Depósito (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-primary font-bold">R$</span>
                  <input
                    type="number"
                    required
                    min="10"
                    placeholder="500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[#101415] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-[#bac9cd]/25"
                  />
                </div>
              </div>

              {/* Quick selectors list */}
              <div className="grid grid-cols-4 gap-2">
                {['50', '200', '500', '1000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(val)}
                    className={`p-2 rounded-lg font-mono text-xs border text-center transition-all cursor-pointer ${
                      depositAmount === val 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-white/5 bg-black/20 text-[#bac9cd]'
                    }`}
                  >
                    +R$ {val}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loadingDeposit}
                className="w-full bg-primary-container text-black font-extrabold py-3 rounded-xl hover:scale-102 transition-all cursor-pointer text-xs font-mono uppercase shadow-[0_0_15px_rgba(0,224,255,0.25)] flex justify-center items-center gap-1.5"
              >
                {loadingDeposit ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black/25 border-t-black animate-spin" />
                    Processando PIX...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
                    Garantir Crédito Instantâneo
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Withdraw Holographic Modal Dialog */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fade-in">
          <div className="bg-[#191c1e] border border-primary/20 rounded-3xl max-w-md w-full p-6 shadow-[0_0_30px_rgba(0,224,255,0.15)] relative space-y-6">
            <button 
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer"
              title="Fechar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2 select-none" style={{fontVariationSettings: "'FILL' 1"}}>account_balance</span>
              <h3 className="text-lg font-bold font-display text-white">Solicitar Retirada Pix</h3>
              <p className="text-[11px] text-on-surface-variant mt-1">Transfira seus fundos livremente de volta para seu banco.</p>
            </div>

            <form onSubmit={handleSimulatedWithdraw} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Valor do Saque (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-primary font-bold">R$</span>
                  <input
                    type="number"
                    required
                    min="20"
                    max={balance}
                    placeholder="1000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[#101415] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="text-[9px] text-[#bac9cd]/40 text-right">Saldo máximo resgatável: R$ {balance.toLocaleString('pt-BR')}</div>
              </div>

              {/* Bank selector options */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-on-surface-variant uppercase">Instituição</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="bg-[#101415] border border-white/10 rounded-xl py-2 px-3 text-xs font-mono text-white cursor-pointer outline-none focus:border-primary"
                  >
                    <option value="NuBank">NuBank</option>
                    <option value="Inter">Banco Inter</option>
                    <option value="Itau">Itaú Unibanco</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="C6">C6 Bank</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-on-surface-variant uppercase">Tipo de Chave</label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value)}
                    className="bg-[#101415] border border-white/10 rounded-xl py-2 px-3 text-xs font-mono text-white cursor-pointer outline-none focus:border-primary"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="CELULAR">Celular</option>
                    <option value="EMAIL">E-mail</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Informação da Chave Pix</label>
                <input
                  type="text"
                  required
                  placeholder={pixKeyType === 'CPF' ? '000.000.000-00' : pixKeyType === 'CELULAR' ? '(11) 99999-9999' : 'exemplo@email.com'}
                  value={pixKeyValue}
                  onChange={(e) => setPixKeyValue(e.target.value)}
                  className="w-full bg-[#101415] border border-white/10 rounded-xl py-3 px-4 text-xs font-mono text-white focus:border-primary outline-none transition-all placeholder:text-white/10"
                />
              </div>

              <button
                type="submit"
                disabled={loadingWithdraw}
                className="w-full bg-primary text-black font-extrabold py-3 rounded-xl hover:scale-102 transition-all cursor-pointer text-xs font-mono uppercase shadow-[0_0_15px_rgba(0,224,255,0.2)] flex justify-center items-center gap-1.5"
              >
                {loadingWithdraw ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black/25 border-t-black animate-spin" />
                    Solicitando Pix...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">send_to_mobile</span>
                    Descontar e Transferir Saldo
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
