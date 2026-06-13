import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Transaction } from '../types';

interface CheckoutProps {
  products: Product[];
  balance: number;
  onDeductBalance: (amount: number) => boolean;
  onAddTransaction: (transaction: Transaction) => void;
  onAddToLibrary: (productId: number | string) => void;
  onConfirmStripe: (productId: number | string) => Promise<void>;
}

export default function Checkout({ 
  products, 
  balance, 
  onDeductBalance, 
  onAddTransaction, 
  onAddToLibrary, 
  onConfirmStripe 
}: CheckoutProps) {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  // Comparação segura de IDs para UUID ou Number
  const product = products.find(p => String(p.id) === String(id));

  if (!product) return <div className="py-20 text-center text-on-surface-variant">Ativo nao encontrado.</div>;

  const handlePayment = async () => {
    setLoading(true);
    // Dispara o fluxo da Stripe real que configuramos no App.tsx
    await onConfirmStripe(product.id);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      {/* Design Aetheric Flux Lights */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Finalizar Aquisicao</h1>
        <p className="text-xs text-on-surface-variant uppercase font-mono tracking-widest">Seguranca garantida por Aetheric Flux & Stripe</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado Esquerdo: Resumo do Produto */}
        <div className="lg:col-span-7">
          <div className="bg-[#1d2022] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex gap-6">
              <img src={product.img} alt="" className="w-32 h-24 rounded-2xl object-cover border border-white/5" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{product.title}</h3>
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{product.format}</span>
                <p className="text-xs text-on-surface-variant mt-3 line-clamp-2">{product.description}</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Licenca Comercial</span>
                <span className="text-white">Inclusa</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Suporte Tecnico</span>
                <span className="text-white">Acesso Vitalicio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Acao de Pagamento */}
        <div className="lg:col-span-5">
          <div className="bg-[#1d2022] border border-primary/20 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            
            <div>
              <p className="text-[10px] font-mono text-on-surface-variant uppercase mb-1">Total a pagar</p>
              <div className="text-4xl font-black text-primary-container font-mono">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-3 pt-4">
             <button
  onClick={handlePayment}
  disabled={loading}
  className="..."
>
  <span className="material-symbols-outlined text-base">
    {Number(product.price) === 0 ? 'redeem' : (loading ? 'sync' : 'lock')}
  </span>
  {loading ? 'Processando...' : (Number(product.price) === 0 ? 'Resgatar Gratuitamente' : 'Pagar com Stripe')}
</button>
              
              <p className="text-[9px] text-center text-on-surface-variant leading-relaxed px-4">
                Ao clicar, voce sera levado para o ambiente seguro da Stripe para realizar o pagamento real.
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 opacity-50">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] font-mono uppercase">PCI-DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}