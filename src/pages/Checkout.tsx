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

  // Busca o produto convertendo ambos para string para evitar conflito UUID vs Number
  const product = products.find(p => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="py-20 text-center text-on-surface-variant font-mono animate-fade-in">
        <span className="material-symbols-outlined text-4xl mb-4 text-error">error</span>
        <p>Ativo não localizado no núcleo de dados.</p>
        <Link to="/" className="text-primary underline mt-4 block">Voltar ao Marketplace</Link>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    // Dispara o fluxo definido no App.tsx (Garante resgate direto se for R$ 0,00 ou Stripe se for pago)
    await onConfirmStripe(product.id);
    setLoading(false);
  };

  const isFree = Number(product.price) === 0;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in relative">
      {/* Design Aetheric Flux: Brilhos Ambientais */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Finalizar Aquisição</h1>
        <p className="text-xs text-on-surface-variant uppercase font-mono tracking-widest">Segurança garantida por Aetheric Flux & Stripe</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Lado Esquerdo: Resumo do Ativo */}
        <div className="lg:col-span-7">
          <div className="bg-[#1d2022] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-32 h-32 sm:h-24 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                <img src={product.img} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1 leading-tight">{product.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-tighter">
                    {product.format}
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant uppercase">
                    {product.category}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">verified</span>
                  Licença Comercial Padrão
                </span>
                <span className="text-white font-bold">Inclusa</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">support_agent</span>
                  Suporte Técnico
                </span>
                <span className="text-white font-bold">Vitalício</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Card de Ação Financeira */}
        <div className="lg:col-span-5">
          <div className="bg-[#1d2022] border border-primary/20 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
            {/* Efeito de brilho interno no card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            
            <div className="relative z-10">
              <p className="text-[10px] font-mono text-on-surface-variant uppercase mb-1 tracking-widest">Valor do investimento</p>
              <div className="text-4xl font-black text-primary-container font-mono tracking-tighter">
                {isFree ? 'GRATUITO' : `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </div>
            </div>

            <div className="space-y-4 relative z-10 pt-4">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-[0_0_20px_rgba(0,224,255,0.3)] hover:shadow-[0_0_40px_rgba(0,224,255,0.5)] hover:scale-[1.02] active:scale-98 transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
                  {loading ? 'sync' : (isFree ? 'redeem' : 'lock')}
                </span>
                <span>
                  {loading ? 'Sincronizando...' : (isFree ? 'Resgatar Gratuitamente' : 'Pagar com Stripe')}
                </span>
              </button>
              
              <p className="text-[9px] text-center text-on-surface-variant leading-relaxed px-4 italic">
                {isFree 
                  ? 'Este ativo será vinculado instantaneamente à sua conta sem necessidade de checkout bancário.' 
                  : 'Ao clicar, você será levado para o ambiente seguro da Stripe para concluir o pagamento criptografado.'}
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 opacity-30 relative z-10">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] font-mono uppercase font-bold tracking-tighter">Security Node Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}