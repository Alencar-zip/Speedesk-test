import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Transaction } from '../types';

interface CheckoutProps {
  products: Product[];
  balance: number;
  onDeductBalance: (amount: number) => boolean;
  onAddTransaction: (transaction: Transaction) => void;
  onAddToLibrary: (productId: number) => void;
}

export default function Checkout({ products, balance, onDeductBalance, onAddTransaction, onAddToLibrary }: CheckoutProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'pix'>('balance');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [simulatedCopied, setSimulatedCopied] = useState(false);

  // Find the product being purchased
  const productId = parseInt(id || '0', 10);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-error mb-4">gavel</span>
        <h2 className="text-xl font-bold text-white mb-2 font-display">Sem Ativo para Checkout</h2>
        <p className="text-xs text-on-surface-variant mb-6">Não foi possível prosseguir pois nenhum item foi selecionado.</p>
        <Link to="/" className="bg-[#272a2c] hover:bg-[#3b494c] px-6 py-2 rounded-xl text-xs font-mono text-white">
          Ir ao Marketplace
        </Link>
      </div>
    );
  }

  const isBalanceEnough = balance >= product.price;

  // Handle default state if balance is short
  useEffect(() => {
    if (!isBalanceEnough) {
      setPaymentMethod('pix');
    }
  }, [isBalanceEnough]);

  const handleProcessPayment = () => {
    setLoading(true);

    // Simulate cyber-payment processing
    setTimeout(() => {
      let isSuccess = false;

      if (paymentMethod === 'balance') {
        const deducted = onDeductBalance(product.price);
        if (deducted) {
          isSuccess = true;
        } else {
          alert('Erro no processamento. Verifique seu saldo.');
          setLoading(false);
          return;
        }
      } else {
        // Pix is always successful for simulation purposes
        isSuccess = true;
      }

      if (isSuccess) {
        // Create transactional auditing item
        const txId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        const date = new Date();
        const formattedDate = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        const newTx: Transaction = {
          id: txId,
          date: formattedDate,
          type: 'Compra',
          source: `${product.title} (${product.format})`,
          amount: -product.price,
          status: 'expense'
        };

        onAddTransaction(newTx);
        onAddToLibrary(product.id);
        setSuccess(true);
      }
      setLoading(false);
    }, 1500);
  };

  const handleCopyPixKey = () => {
    setSimulatedCopied(true);
    setTimeout(() => setSimulatedCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-[#1d2022] border border-primary/20 rounded-3xl p-8 text-center shadow-[0_0_40px_rgba(0,224,255,0.05)] my-8 animate-fade-in">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
          <span className="material-symbols-outlined text-primary text-3xl select-none" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
        </div>

        <h2 className="text-2xl font-black font-display text-white mb-2">Transação Concluída!</h2>
        <span className="text-[10px] font-mono text-[#bac9cd]/50 uppercase tracking-widest block mb-4">Recibo ID: SPEED-{Math.floor(100000 + Math.random()*900000)}</span>

        <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
          Seu pagamento de <span className="text-white font-bold font-mono">R$ {product.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span> foi verificado com sucesso pelo sistema AETHERIC. O ativo <span className="text-primary font-bold">{product.title}</span> já foi integrado à sua coleção!
        </p>

        <div className="bg-[#101415]/70 border border-white/5 p-4 rounded-2xl mb-6 text-left">
          <span className="text-[9px] font-mono text-[#bac9cd]/50 block mb-1">Licença do Ativo</span>
          <code className="text-xs font-mono text-primary-container block select-all bg-black/40 p-2 rounded border border-white/5 truncate">
            KEY-OWN-{product.id}-{Math.random().toString(36).substring(2,10).toUpperCase()}
          </code>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/library')}
            className="w-full bg-primary-container text-black font-bold py-3 rounded-xl transition-all hover:scale-102 cursor-pointer text-xs font-mono shadow-[0_0_15px_rgba(0,224,255,0.2)]"
          >
            ACESSAR SUA COLEÇÃO
          </button>
          <Link
            to="/"
            className="text-xs text-on-surface-variant hover:text-white transition-colors py-2 font-semibold"
          >
            Voltar ao Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-bold font-display text-white tracking-tight mb-2">Checkout de Ativo</h1>
        <p className="text-xs text-on-surface-variant">Confirme os detalhes e conclua sua compra segura.</p>
      </header>

      {loading ? (
        /* Cyber loading pane */
        <div className="bg-[#191c1e] border border-white/5 rounded-3xl p-16 text-center shadow-xl space-y-4 my-10 min-h-[300px] flex flex-col justify-center items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <h3 className="text-lg font-bold text-white font-display">Processando Transação</h3>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            Verificando fundos e gravando metadados na rede Aetheric... Por favor, aguarde.
          </p>
        </div>
      ) : (
        /* Regular Checkout Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Payment choices */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#1d2022] border border-white/5 rounded-2xl p-6 space-y-6">
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">
                Selecione o Meio de Pagamento
              </h3>

              <div className="space-y-3">
                {/* Balance Method (Conditional) */}
                <button
                  onClick={() => isBalanceEnough && setPaymentMethod('balance')}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${
                    !isBalanceEnough 
                      ? 'opacity-50 cursor-not-allowed border-[#3b494c]/20 bg-[#101415]/30' 
                      : paymentMethod === 'balance'
                        ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,224,255,0.05)] cursor-pointer'
                        : 'border-white/5 bg-black/20 hover:border-white/15 cursor-pointer'
                  }`}
                  disabled={!isBalanceEnough}
                  id="checkout-option-balance-btn"
                >
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5 select-none" style={{fontVariationSettings: paymentMethod === 'balance' ? "'FILL' 1" : undefined}}>
                    account_balance_wallet
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Saldo da Carteira</span>
                      <span className="text-xs font-mono font-bold text-primary-container">
                        R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                      {isBalanceEnough 
                        ? 'Dedução rápida e instantânea de seus fundos na plataforma.' 
                        : 'Saldo insuficiente. Clique em "Carteira" no menu lateral para recarregar.'}
                    </p>
                  </div>
                </button>

                {/* Pix Method */}
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,224,255,0.05)]'
                      : 'border-white/5 bg-black/20 hover:border-white/15'
                  }`}
                  id="checkout-option-pix-btn"
                >
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5 select-none" style={{fontVariationSettings: paymentMethod === 'pix' ? "'FILL' 1" : undefined}}>
                    qr_code_2
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-white block">Pix Estantâneo</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                      Pagamento QR fácil com aprovação automatizada em menos de 10 segundos.
                    </p>
                  </div>
                </button>
              </div>

              {/* Conditional parameters rendering based on chosen payment method */}
              {paymentMethod === 'pix' && (
                <div className="bg-[#101415]/70 border border-[#3b494c]/20 p-5 rounded-2xl space-y-4 animate-fade-in text-center">
                  <div className="mx-auto w-40 h-40 bg-white p-2 rounded-xl border border-[#baf2ff]/30 shadow-[0_0_15px_rgba(0,224,255,0.15)] flex items-center justify-center relative">
                    {/* Simulated Pix QR Code vector design using CSS */}
                    <div className="w-full h-full border border-dashed border-gray-400 p-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-10 h-10 bg-black rounded" />
                        <div className="w-10 h-10 bg-black rounded" />
                      </div>
                      <div className="text-[10px] font-mono font-bold text-black select-none uppercase tracking-tighter">
                        SPEEDESK PIX
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-10 h-10 bg-black rounded" />
                        <div className="w-6 h-6 border-4 border-black rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                      Escaneie o código QR acima no aplicativo do seu banco ou copie a chave Pix "Copia e Cola" abaixo:
                    </p>

                    <div className="flex gap-2 bg-[#101415] p-2 rounded-xl border border-white/5 max-w-md mx-auto">
                      <input
                        type="text"
                        readOnly
                        value="00020101021226830014br.gov.pix0140speed@aetheric0520000053039865405"
                        className="bg-transparent text-[10px] font-mono text-primary truncate select-all flex-1 py-1 px-2 border-none outline-none focus:ring-0"
                      />
                      <button
                        onClick={handleCopyPixKey}
                        className="bg-primary/10 hover:bg-primary/20 text-primary px-3 rounded-lg text-[10px] font-mono font-bold transition-all shrink-0 cursor-pointer border border-primary/20"
                      >
                        {simulatedCopied ? 'COPIADO' : 'COPIAR'}
                      </button>
                    </div>

                    <div className="text-[9px] font-mono text-[#bac9cd]/40">
                      Válido por mais 14:55 minutos • Liberação imediata após clique no botão abaixo.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Block: Cart Summary & confirmation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1d2022] border border-[#3b494c]/20 p-6 rounded-2xl space-y-6">
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">
                Resumo do Pedido
              </h3>

              {/* Product Info row */}
              <div className="flex gap-4 items-center border-b border-white/5 pb-4">
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-surface-dim border border-white/10 shrink-0">
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                  <span className="text-[9px] font-mono text-primary uppercase block tracking-wider font-semibold mt-0.5">
                    Formato: {product.format} • {product.specs.size}
                  </span>
                </div>
              </div>

              {/* Calculation List */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ativo Digital</span>
                  <span className="font-mono text-white">R$ {product.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Desconto de Estreia</span>
                  <span className="font-mono text-green-400">R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Taxa de Rede (Aetheric)</span>
                  <span className="font-mono text-green-400">ISENTO</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between font-bold text-sm">
                  <span className="text-white">Total Geral</span>
                  <span className="font-mono text-primary">R$ {product.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
              </div>

              {/* Order checkout action trigger */}
              <button
                onClick={handleProcessPayment}
                className="w-full bg-primary text-black font-black py-3.5 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(0,218,248,0.2)] hover:scale-103 text-xs tracking-wider font-mono flex items-center justify-center gap-2 uppercase"
                id="execute-purchase-confirm-btn"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                {paymentMethod === 'balance' ? 'Confirmar Compra Segura' : 'Simular Confirmação do Pix'}
              </button>

              <div className="text-center font-mono text-[9px] text-on-surface-variant/40 leading-relaxed uppercase">
                Garantia de atualização vitalícia inclusa • Conexão encriptada SSL de 256bits
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
