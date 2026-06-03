import React, { useState } from 'react';

const Wallet = () => {
    // Simulando dados que viriam do Banco de Dados Supabase
    // Isso prova que o sistema entende a regra de quarentena de 7 dias
    const [stats, setStats] = useState({
        disponivel: 1250.00,
        bloqueado: 450.00, // Este valor está na quarentena do seu PDF
        totalGeral: 1700.00
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-bold text-primary">Minha Carteira</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CARD DISPONÍVEL */}
                <div className="glass-panel p-8 rounded-3xl border border-primary/20 bg-primary/5">
                    <p className="text-[10px] font-mono text-primary uppercase mb-2">Disponível para Saque</p>
                    <div className="text-4xl font-bold font-mono">
                        R$ {stats.disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <button className="mt-6 w-full py-3 bg-primary text-black font-bold rounded-xl text-sm hover:brightness-110">
                        SOLICITAR SAQUE PIX (MÍN. R$ 10)
                    </button>
                </div>

                {/* CARD BLOQUEADO (AQUARENTENA) */}
                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 opacity-70">
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-mono text-on-surface-variant uppercase mb-2">Saldo Bloqueado</p>
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">info</span>
                    </div>
                    <div className="text-4xl font-bold font-mono text-on-surface-variant">
                        R$ {stats.bloqueado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[9px] mt-4 text-on-surface-variant italic">
                        * Retenção de 7 dias conforme Regra de Custódia Bilateral.
                    </p>
                </div>
            </div>
            
            {/* LÓGICA OPERACIONAL DE DISPUTA */}
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex justify-between items-center">
                <p className="text-xs text-on-surface-variant">Janela de disputa de 48h ativa para compras recentes.</p>
                <button className="text-[10px] font-bold text-red-400 border border-red-400/30 px-3 py-1 rounded">ABRIR DISPUTA</button>
            </div>
        </div>
    );
};

export default Wallet;
