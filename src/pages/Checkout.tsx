import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Transaction } from '../types';

// 1. Interface atualizada para incluir a função da Stripe vinda do App.tsx
interface CheckoutProps {
  products: Product[];
  balance: number;
  onDeductBalance: (amount: number) => boolean;
  onAddTransaction: (transaction: Transaction) => void;
  onAddToLibrary: (productId: number) => void;
  onConfirmStripe: (productId: number) => Promise<void>; // Nova prop
}

export default function Checkout({ 
  products, 
  balance, 
  onDeductBalance, 
  onAddTransaction, 
  onAddToLibrary,
  onConfirmStripe // Destruturação da nova prop
}: CheckoutProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Adicionado 'stripe' como opção de método de pagamento
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'pix' | 'stripe'>('balance');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [simulatedCopied, setSimulatedCopied] = useState(false);

  const productId = parseInt(id || '0', 10);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-error mb-4">gavel</span>
        <h2 className="text-xl font-bold text-white mb-2 font-display">Sem Ativo para Checkout</h2>
        <p className="text-xs text-on-surface-variant mb-6">Não foi possível prosseguir.</p>
        <Link to="/" className="bg-[#272a2c] px-6 py-2 rounded-xl text-xs font-mono text-white">Voltar</Link>
      </div>
    );
  }

  const isBalanceEnough = balance >= product.price;

  useEffect(() => {
    if (!isBalanceEnough) {
      setPaymentMethod('stripe'); // Se não tiver saldo, sugere Stripe (Cartão) por padrão
    }
  }, [isBalanceEnough]);

  const handleProcessPayment = async () => {
    // LÓGICA DO ITEM 3: Se for Stripe, chama a API real
    if (paymentMethod === 'stripe') {
      setLoading(true);
      await onConfirmStripe(product.id);
      setLoading(false);
      return;
    }

    // Lógica de Simulação (Saldo ou PIX)
    setLoading(true);
    setTimeout(() => {
      let isSuccess = false;

      if (paymentMethod === 'balance') {
        const deducted = onDeductBalance(product.price);
        if (deducted) isSuccess = true;
        else { alert('Saldo insuficiente'); setLoading(false); return; }
      } else {
        isSuccess = true; // Simulação de PIX
      }

      if (isSuccess) {
        const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        onAddTransaction({
          id: txId,
          date: new Date().toLocaleDateString('pt-BR'),
          type: 'Compra',
          source: `${product.title}`,
          amount: -product.price,
          status: 'expense'
        });
        onAddToLibrary(product.id);
        setSuccess(true);
      }
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-[#1d2022] border border-primary/20 rounded-3xl p-8 text-center my-8 animate-fade-in">
        <span className="material-symbols-outlined text-primary text-5xl mb-6">check_circle</span>
        <h2 className="text-2xl font-black text-white mb-2">Sucesso!</h2>
        <p className="text-xs text-on-surface-variant mb-6">Ativo integrado à sua coleção.</p>
        <button onClick={() => navigate('/library')} className="w-full bg-primary-container text-black font-bold py-3 rounded-xl text-xs font-mono">ACESSAR MINHA BIBLIOTECA</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter">Checkout de Ativo</h1>
        <p className="text-xs text-on-surface-variant">Conclua sua compra de forma segura.</p>
      </header>

      {loading ? (
        <div className="bg-[#191c1e] rounded-3xl p-16 text-center space-y-4 my-10">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Processando...</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Método de Pagamento</h3>
              
              {/* Opção: Saldo */}
              <button onClick={() => isBalanceEnough && setPaymentMethod('balance')} className={`w-full p-4 rounded-xl border text-left flex gap-4 ${paymentMethod === 'balance' ? 'border-primary bg-primary/5' : 'border-white/5 opacity-50'}`}>
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <div>
                  <div className="text-sm font-bold">Saldo Speedesk (R$ {balance.toFixed(2)})</div>
                  <p className="text-[10px] text-on-surface-variant">Uso imediato do seu saldo interno.</p>
                </div>
              </button>

              {/* Opção: Stripe (Cartão de Crédito) */}
              <button onClick={() => setPaymentMethod('stripe')} className={`w-full p-4 rounded-xl border text-left flex gap-4 ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5' : 'border-white/5'}`}>
                <span className="material-symbols-outlined text-primary">payments</span>
                <div>
                  <div className="text-sm font-bold">Cartão de Crédito (Stripe)</div>
                  <p className="text-[10px] text-on-surface-variant">Pagamento seguro processado via Stripe.</p>
                </div>
              </button>

              {/* Opção: PIX */}
              <button onClick={() => setPaymentMethod('pix')} className={`w-full p-4 rounded-xl border text-left flex gap-4 ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-white/5'}`}>
                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                <div>
                  <div className="text-sm font-bold">PIX Instantâneo</div>
                  <p className="text-[10px] text-on-surface-variant">Liberação rápida via QR Code.</p>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Resumo</h3>
              <div className="flex justify-between font-bold text-lg border-t border-white/5 pt-4">
                <span>Total</span>
                <span className="text-primary">R$ {product.price.toLocaleString('pt-BR')}</span>
              </div>

              <button 
                onClick={handleProcessPayment} 
                className="w-full bg-primary text-black font-black py-4 rounded-xl shadow-lg hover:scale-102 transition-all uppercase text-xs font-mono"
              >
                {paymentMethod === 'stripe' ? 'Pagar com Stripe' : 'Confirmar Compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}