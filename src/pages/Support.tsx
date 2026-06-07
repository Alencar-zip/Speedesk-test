import React, { useState, useEffect, useRef } from 'react';
import { SupportTicket, Product } from '../types';

interface SupportProps {
  products: Product[];
  username: string;
  userRole?:  'Admin' | 'Moderador' | 'User' | 'Suporte';
}

export default function Support({ products, username, userRole }: SupportProps) {
  // Initial default tickets for showcase
  const defaultTickets: SupportTicket[] = [
    {
      id: 'TK-9402',
      subject: 'Falso Positivo de Antivírus: Recurso de Ativo',
      productTitle: 'Dashboard Pro SaaS Template',
      createdAt: new Date(Date.now() - 4 * 3600000).toLocaleString('pt-BR'),
      status: 'human_mediation',
      messages: [
        {
          id: '1',
          sender: 'user',
          senderName: username,
          text: 'O antivírus Sandbox de IA colocou meu arquivo compactado indexado em quarentena técnica automática, mas é apenas um slide de PowerPoint com fontes personalizadas e alguns macros VBA nativos para gráficos interativos. Podem reavaliar por favor?',
          time: '08:15:30'
        },
        {
          id: '2',
          sender: 'model',
          senderName: 'Speedesk AI Antivírus',
          text: 'Olá! Sou o assistente automatizado do Antivírus Sandbox. Detectei o uso de Macros VBA em lote contendo chamadas externas não especificadas, o que acionou meu alerta heurístico de nível 3 para Trojan.Downloader. Recomendo escalar para auditoria humana direta para verificação estrutural física das macros de segurança.',
          time: '08:16:12'
        },
        {
          id: '3',
          sender: 'human',
          senderName: 'Arthur K. (Auditor Técnico)',
          text: 'Entrei no ticket de revisão de segurança. Baixei seu arquivo compactado e verifiquei o código VBA das planilhas e slides. Confirmamos que é um código seguro de renderização vetorial e que o alerta heurístico era um falso positivo pelo formato do compilador. Acabo de forçar a liberação comercial do seu ativo. Status atualizado!',
          time: '11:45:00'
        }
      ]
    },
    {
      id: 'TK-5831',
      subject: 'Suporte de Transação: Reembolso solicitado',
      productTitle: 'Minimalist Portfolio Deck (Figma)',
      createdAt: new Date(Date.now() - 24 * 3600000).toLocaleString('pt-BR'),
      status: 'ai_triage',
      messages: [
        {
          id: '1',
          sender: 'user',
          senderName: username,
          text: 'Efetuei a compra do ativo ontem e verifiquei que o link do Figma original está quebrado para visualização compartilhada. O criador não respondeu minhas mensagens. Solicito reembolso por item defeituoso comercial.',
          time: 'Ontem, 14:10'
        },
        {
          id: '2',
          sender: 'model',
          senderName: 'Speedesk AI Mediador',
          text: 'Lamento pelo contratempo com as permissões de acesso do Figma! Nossa política de comércio garante reembolso em até 7 dias para ativos com defeito técnico ou links inacessíveis. Registrei a primeira triagem. Se o criador não atualizar as chaves de acesso em 12h, o reembolso será processado. Deseja escalar para um moderador humano acelerar este parecer?',
          time: 'Ontem, 14:12'
        }
      ]
    },
    {
      id: 'TK-1204',
      subject: 'Problema Operacional: Saque Pix atrasado',
      productTitle: undefined,
      createdAt: new Date(Date.now() - 48 * 3600000).toLocaleString('pt-BR'),
      status: 'resolved',
      messages: [
        {
          id: '1',
          sender: 'user',
          senderName: username,
          text: 'Solicitei um saque para minha chave Pix que é meu e-mail, mas consta como pendente por mais de 10 minutos. O prazo médio não era de 5 minutos?',
          time: '01/06/2026, 12:00'
        },
        {
          id: '2',
          sender: 'model',
          senderName: 'Speedesk AI Financeiro',
          text: 'Olá! Geralmente os saques via Pix são concluídos em segundos, porém aos domingos bancos parceiros podem temporariamente reter transações para auditoria de lavagem de dinheiro em quotas superiores a R$ 10.000,00.',
          time: '01/06/2026, 12:02'
        },
        {
          id: '3',
          sender: 'human',
          senderName: 'Marina S. (Suporte Financeiro)',
          text: 'Olá, alex! Identificamos que o banco de destino recusou o Pix de teste porque seu e-mail cadastrado estava sem a verificação de autenticação de dois fatores. Liberei o Pix alternativamente de forma manual para sua segunda chave cadastrada. Por favor, confirme o saldo na sua carteira.',
          time: '01/06/2026, 12:15'
        },
        {
          id: '4',
          sender: 'user',
          senderName: username,
          text: 'O dinheiro acabou de cair aqui na conta do banco! Muito obrigado pela velocidade e atenção manual da Marina. Resolvido!',
          time: '01/06/2026, 12:18'
        }
      ]
    }
  ];

  // Load from local storage
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('speedesk_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultTickets;
      }
    }
    return defaultTickets;
  });

  const [activeTicketId, setActiveTicketId] = useState<string>(tickets[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  // Form for new ticket
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSubject, setNewSubject] = useState('Dúvida Geral sobre Downloads e Fontes');
  const [newProduct, setNewProduct] = useState('');
  const [newText, setNewText] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom when active ticket or message count changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicketId, tickets]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('speedesk_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  // Form submission handler to open a new dispute/support case
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const ticketsCount = tickets.length + 1000;
    const newId = `TK-${Math.floor(Math.random() * 9000) + 1000}`;
    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    const ticket: SupportTicket = {
      id: newId,
      subject: newSubject,
      productTitle: newProduct || undefined,
      createdAt: new Date().toLocaleString('pt-BR'),
      status: 'ai_triage',
      messages: [
        {
          id: '1',
          sender: 'user',
          senderName: username,
          text: newText.trim(),
          time: timestamp()
        }
      ]
    };

    setTickets(prev => [ticket, ...prev]);
    setActiveTicketId(newId);
    setNewText('');
    setNewProduct('');
    setShowNewForm(false);
    setIsSending(true);

    // AI dynamic first response automatically kicks off using our backend endpoint
    try {
      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newSubject,
          productTitle: newProduct,
          history: [],
          newMessage: newText.trim()
        })
      });

      if (!response.ok) throw new Error('Falha no servidor de suporte');
      const data = await response.json();

      const aiMsg = {
        id: '2',
        sender: 'model' as const,
        senderName: 'Speedesk AI Mediador',
        text: data.text || 'Obrigado por registrar seu tíquete de suporte. Um auditor de plantão está analisando suas metadados.',
        time: timestamp()
      };

      setTickets(prev => prev.map(t => {
        if (t.id === newId) {
          return {
            ...t,
            messages: [...t.messages, aiMsg]
          };
        }
        return t;
      }));

    } catch (err) {
      console.error('Falha ao processar resposta inicial de IA:', err);
      // Fallback
      setTimeout(() => {
        const fallMsg = {
          id: '2',
          sender: 'model' as const,
          senderName: 'Speedesk AI Mediador',
          text: 'Recebemos seu ticket na central. O sistema de suporte inteligente 50% / 50% está analisando as especificações do arquivo em Sandbox. Você pode escalar diretamente para um gerente profissional clicando em **"Chamar Mediador Humano"**.',
          time: timestamp()
        };
        setTickets(prev => prev.map(t => t.id === newId ? { ...t, messages: [...t.messages, fallMsg] } : t));
      }, 1000);
    } finally {
      setIsSending(false);
    }
  };

  // Sending a message in the active chat conversation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket) return;

    const userMsgText = newMessage;
    setNewMessage('');
    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    const isAgent = userRole === 'Admin' || userRole === 'Suporte';

    const userMsg = {
      id: Date.now().toString(),
      sender: isAgent ? ('human' as const) : ('user' as const),
      senderName: isAgent ? `${username} (${userRole})` : username,
      text: userMsgText,
      time: timestamp()
    };

    // Append user/agent message
    const updatedMessages = [...activeTicket.messages, userMsg];
    setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, messages: updatedMessages } : t));

    // If active user is an agent, simple append response and exit without bot replies
    if (isAgent) {
      return;
    }

    setIsSending(true);

    if (activeTicket.status === 'human_mediation') {
      // 50% Human: Simulate real support advisor replying contextually after 1.5s
      setTimeout(() => {
        const humanNames = ['Arthur K. (Auditor Técnico)', 'Marina S. (Suporte Financeiro)', 'Clarissa L. (Gerência Comercial)'];
        const selectedHuman = activeTicket.subject.toLowerCase().includes('antivírus') 
          ? humanNames[0] 
          : activeTicket.subject.toLowerCase().includes('saque') || activeTicket.subject.toLowerCase().includes('carteira')
            ? humanNames[1]
            : humanNames[2];

        let replyText = '';
        const norm = userMsgText.toLowerCase();

        if (norm.includes('obrigado') || norm.includes('valeu') || norm.includes('resolvido')) {
          replyText = "Excelente! Fico muito contente em poder te ajudar rapidamente com seu arquivo e regularidade de vendas. Vou atualizar o status deste caso para resolvido. Desejo ótimos negócios no marketplace!";
        } else if (norm.includes('reembolso') || norm.includes('estorno') || norm.includes('dinheiro')) {
          replyText = `Compreendo perfeitamente sua preocupação comercial. Conferi os metadados e o arquivo ZIP original. De fato, as fontes citadas não foram empacotadas no ZIP final do ativo de apresentação. Aprovei o estorno manual de R$ 150,00 para sua Carteira virtual de maneira prioritária. A transação já consta no seu extrato.`;
        } else {
          replyText = `Recebido alex. Acabo de verificar esses detalhes adicionais na nossa base de logs. Fique tranquilo que o suporte humano está acompanhando o caso ativamente e daremos todo o respaldo necessário para que os layouts funcionem perfeitamente. Alguma outra dúvida?`;
        }

        const humanResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'human' as const,
          senderName: selectedHuman,
          text: replyText,
          time: timestamp()
        };

        setTickets(prev => prev.map(t => {
          if (t.id === activeTicket.id) {
            return {
              ...t,
              messages: [...t.messages, humanResponse],
              status: replyText.includes('resolvido') ? 'resolved' : t.status
            };
          }
          return t;
        }));

        setIsSending(false);
      }, 1500);

    } else {
      // 50% AI: Trigger Gemini support-chat route
      try {
        const payloadHistory = activeTicket.messages.map(m => ({
          role: m.sender === 'user' ? 'user' : m.sender === 'human' ? 'human' : 'model',
          text: m.text
        }));

        const response = await fetch('/api/support-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: activeTicket.subject,
            productTitle: activeTicket.productTitle || '',
            history: payloadHistory,
            newMessage: userMsgText
          })
        });

        if (!response.ok) throw new Error('Servidor indisponível.');
        const data = await response.json();

        const aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'model' as const,
          senderName: 'Speedesk AI Mediador',
          text: data.text || 'Processando sua solicitação inicial.',
          time: timestamp()
        };

        setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, messages: [...t.messages, aiResponse] } : t));
      } catch (err) {
        console.error('Falha ao conversar com IA de suporte:', err);
        // Fallback response
        setTimeout(() => {
          const aiResponse = {
            id: (Date.now() + 1).toString(),
            sender: 'model' as const,
            senderName: 'Speedesk AI Mediador',
            text: 'Como IA, entendo sua solicitação. Entretanto, para ações que envolvam transações financeiras críticas ou exclusão de quarentena manual, recomendo clicar em **"Chamar Mediador Humano"** para acionar nosso time de auditoria presencial imediata.',
            time: timestamp()
          };
          setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, messages: [...t.messages, aiResponse] } : t));
        }, 1000);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Escalating to human agent (Simulation)
  const handleEscalateToHuman = () => {
    if (!activeTicket || activeTicket.status === 'human_mediation') return;

    setIsEscalating(true);
    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    // Update state immediately to showing search status
    setTickets(prev => prev.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: 'human_mediation',
          messages: [
            ...t.messages,
            {
              id: `sys-${Date.now()}`,
              sender: 'human',
              senderName: 'Sistema Speedesk',
              text: '🚨 **MEDIAÇÃO ACIONADA**: O usuário ativou os 50% de suporte humano. Roteando ticket para fila prioritária de conformidade comercial...',
              time: timestamp()
            }
          ]
        };
      }
      return t;
    }));

    // Trigger human moderator entrance after 2s
    setTimeout(() => {
      const isFin = activeTicket.subject.toLowerCase().includes('saque') || activeTicket.subject.toLowerCase().includes('transação') || activeTicket.subject.toLowerCase().includes('estorno');
      const humanName = isFin ? 'Marina S. (Suporte Financeiro)' : 'Arthur K. (Auditor Técnico)';
      const introMessage = isFin 
        ? 'Olá! Sou a Marina, especialista de conformidade financeira da plataforma. Identifiquei sua divergência de saques/transação neste ativo comercial. Estou puxando a fila de auditoria física de envio do arquivo ZIP para verificar as alegações e resolver este chamado imediatamente.'
        : 'Olá! Sou o Arthur da engenharia de conformidade de arquivos do Speedesk. Recebi o alerta de recurso referente à quarentena antivírus do Sandbox de IA. Estou abrindo o pacote do arquivo e auditando logs do sistema para as devidas correções contra falsos positivos de software.';

      const brokerMsg = {
        id: `broker-${Date.now()}`,
        sender: 'human' as const,
        senderName: humanName,
        text: introMessage,
        time: timestamp()
      };

      setTickets(prev => prev.map(t => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            messages: [...t.messages, brokerMsg]
          };
        }
        return t;
      }));
      setIsEscalating(false);
    }, 2000);
  };

  // Clearing cases history logic
  const handleResetCases = () => {
    setTickets(defaultTickets);
    setActiveTicketId(defaultTickets[0].id);
    localStorage.setItem('speedesk_tickets', JSON.stringify(defaultTickets));
  };

  return (
    <div className="pb-16 animate-fade-in relative max-w-6xl mx-auto">
      {/* Lights background blur */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-10 right-20 w-72 h-72 bg-[#c0c1ff]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-black text-primary font-display tracking-tighter mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>support_agent</span>
            Suporte & Ajuda
          </h1>
          <p className="text-xs text-[#8b9293] font-medium leading-relaxed">
            Central de atendimento, suporte técnico e ajuda especializada.
          </p>
        </div>

        {/* Global actions: New tickets and reset controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleResetCases}
            className="border border-white/5 bg-[#171a1c]/60 hover:bg-white/5 text-[10px] font-mono px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:text-white transition-all uppercase"
          >
            Redefinir Histórico
          </button>
          
          <button
            onClick={() => {
              setShowNewForm(!showNewForm);
            }}
            className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-mono font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-base">add_box</span>
            Abrir Ticket
          </button>
        </div>
      </header>

      {/* NEW TICKET FORM BOX */}
      {showNewForm && (
        <div className="bg-[#1d2022] border border-primary/20 rounded-2xl p-6 mb-6 shadow-2xl relative animate-slide-in">
          <div className="absolute top-0 right-0 p-4">
            <button 
              onClick={() => setShowNewForm(false)} 
              className="text-[#bac9cd] hover:text-white"
              title="Close form"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
          <h3 className="font-bold font-display text-base text-white mb-1 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">support</span>
            Abrir Chamado
          </h3>
          <p className="text-[10px] text-on-surface-variant mb-5">
            Descreva seu caso com detalhes. Forneça o máximo de informações possível para acelerar o atendimento.
          </p>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">Selecione a Categoria do Suporte</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary font-mono"
                >
                  <option value="Falso Positivo de Antivírus (Recurso contra Quarentena)">Recurso contra Bloqueio / Quarentena do Antivírus</option>
                  <option value="Suporte Comercial: Reembolso solicitado por Item Defeituoso">Suporte de Transação (Reembolso de Ativo Defeituoso)</option>
                  <option value="Problema Operacional com Retirada de Saldo / PIX">Problemas Técnicos com Saque Pix ou Faturamento</option>
                  <option value="Dúvida Geral sobre Downloads e Compatibilidade">Dúvida Geral / Configurações Figma e Keynote</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">Ativo do Marketplace Relacionado (Opcional)</label>
                <select
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="bg-[#101415] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary font-mono"
                >
                  <option value="">Nenhum / Dúvida Geral</option>
                  {products.map(p => (
                    <option key={p.id} value={p.title}>{p.title} (R$ {p.price.toFixed(2)})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">Mensagem de Explicação & Detalhes do Suporte</label>
              <textarea
                required
                rows={3}
                placeholder="Descreva detalhadamente o ocorrido. Ex: O arquivo ZIP baixado veio em formato corrompido, ou informe as linhas de código que causaram falso positivo no scanner."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-primary placeholder:text-on-surface-variant/40"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-primary text-black font-black uppercase text-xs tracking-wider rounded-xl hover:scale-101 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
            >
              <span className="material-symbols-outlined text-[16px]">support</span>
              Enviar Chamado
            </button>
          </form>
        </div>
      )}

      {/* MAIN TWO COLUMN CHAT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT COLUMN: TICKETS DIRECT_INDEX (Lado Humano / Auditoria) */}
        <section className="lg:col-span-4 bg-[#1d2022]/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h4 className="text-[10px] font-mono text-white tracking-widest font-bold uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm select-none">forum</span>
                Histórico de Chamados ({tickets.length})
              </h4>
            <span className="text-[8px] font-mono bg-white/5 border border-white/15 px-2 py-0.5 rounded text-on-surface-variant">LISTA REAL</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {tickets.map(t => {
              const isActive = t.id === activeTicketId;
              const hasHuman = t.status === 'human_mediation';
              const isResolved = t.status === 'resolved';

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTicketId(t.id);
                    setShowNewForm(false);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all relative cursor-pointer ${
                    isActive 
                      ? 'bg-primary/5 border-primary shadow-[0_0_10px_rgba(0,188,248,0.06)]' 
                      : 'bg-[#101415]/40 border-white/5 hover:bg-[#1a1e20]/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-primary font-bold">{t.id}</span>
                    <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      isResolved 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : hasHuman 
                          ? 'bg-[#c0c1ff]/15 text-[#c0c1ff] border-[#c0c1ff]/20 animate-pulse'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {isResolved ? 'Resolvido' : hasHuman ? 'Com Humano' : 'Virtual'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white leading-snug line-clamp-1">{t.subject}</p>
                  
                  {t.productTitle && (
                    <p className="text-[10px] text-on-surface-variant font-mono mt-1 flex items-center gap-1 truncate">
                      <span className="material-symbols-outlined text-xs select-none">draft</span>
                      {t.productTitle}
                    </p>
                  )}

                  <p className="text-[9px] text-[#bac9cd]/40 font-mono text-right mt-2">{t.createdAt}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: ACTIVE INTERACTIVE PORTAL (Interactive Chat Space) */}
        <section className="lg:col-span-8 bg-[#1d2022]/40 border border-white/10 rounded-2xl flex flex-col min-h-[500px] max-h-[600px] overflow-hidden relative">
          
          {activeTicket ? (
            <>
              {/* HEADER OF ACTIVE CASE */}
              <div className="p-4 border-b border-white/5 bg-[#101415]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                
                {/* Case Title and Level */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-primary font-bold">{activeTicket.id}</span>
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[9px] text-[#bac9cd]/60 font-mono uppercase tracking-widest">{activeTicket.createdAt}</span>
                  </div>
                  <h3 className="text-xs font-bold font-display text-white mt-1 truncate max-w-md">{activeTicket.subject}</h3>
                </div>

                {/* 50/50 Escalation Trigger Button */}
                <div className="flex flex-wrap gap-2 items-center">
                  {(userRole === 'Admin' || userRole === 'Suporte') && (
                    <>
                      {activeTicket.status !== 'resolved' ? (
                        <button
                          onClick={() => {
                            setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, status: 'resolved' } : t));
                          }}
                          className="bg-green-500 text-black hover:bg-green-600 text-[10px] font-mono font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md border-none"
                        >
                          <span className="material-symbols-outlined text-xs select-none font-bold">check_circle</span>
                          Resolver Caso
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, status: 'human_mediation' } : t));
                          }}
                          className="bg-[#c0c1ff]/10 hover:bg-[#c0c1ff]/20 text-[#c0c1ff] border border-[#c0c1ff]/20 text-[10px] font-mono font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <span className="material-symbols-outlined text-xs select-none">replay</span>
                          Reabrir
                        </button>
                      )}
                    </>
                  )}

                  {activeTicket.status === 'ai_triage' ? (
                    <button
                      onClick={handleEscalateToHuman}
                      disabled={isEscalating}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-500/25 to-[#c0c1ff]/20 text-[#c0c1ff] border border-red-500/20 hover:scale-102 hover:border-red-500/40 text-[10px] font-mono font-bold px-3.5 py-2 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span className="material-symbols-outlined text-sm select-none">person_pin</span>
                      {isEscalating ? 'Acionando Fila...' : 'Chamar Mediador Humano'}
                    </button>
                  ) : activeTicket.status === 'human_mediation' ? (
                    <div className="px-3.5 py-2.5 rounded-xl border border-[#c0c1ff]/20 bg-[#c0c1ff]/10 text-center">
                      <span className="text-[9px] font-mono text-[#c0c1ff] uppercase tracking-widest font-black flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-xs select-none" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                        Moderador Arthur Ativo
                      </span>
                    </div>
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl border border-green-500/20 bg-green-500/15 text-center">
                      <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest font-black flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-xs select-none">task_alt</span>
                        Chamado Resolvido
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* ACTIVE TIMELINE CHAT BODY */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#101415]/10 flex flex-col">
                
                {/* Helper instruction */}
                <div className="bg-[#191c1e]/40 border border-white/5 rounded-xl p-3 flex items-start gap-2 text-[10px] text-on-surface-variant font-mono mb-2">
                  <span className="material-symbols-outlined text-sm text-primary select-none mt-0.5">info</span>
                  <div className="leading-relaxed">
                    <strong className="text-white">Central de Chamados</strong>: Caso as respostas iniciais não ajudem ou você precise de auxílio específico com uma transação ou arquivo, basta solicitar o atendimento manual clicando em "Chamar Mediador Humano".
                  </div>
                </div>

                {activeTicket.messages.map((m) => {
                  const isUser = m.sender === 'user';
                  const isSystem = m.senderName.includes('Sistema');
                  const isAI = m.sender === 'model';
                  const isHumanMod = m.sender === 'human' && !isSystem;

                  if (isSystem) {
                    return (
                      <div key={m.id} className="text-center py-2.5">
                        <div className="inline-block bg-[#241a1b] border border-red-500/10 px-4 py-2 rounded-xl max-w-xl">
                          <p className="text-[10px] text-red-300 font-mono font-medium leading-relaxed">{m.text}</p>
                          <span className="text-[8px] text-on-surface-variant font-mono block mt-1">{m.time}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      {/* Name of sender and Tag identifier representation */}
                      <span className="text-[9px] font-mono text-[#bac9cd]/40 mb-1 flex items-center gap-1.5 px-1.5">
                        {m.senderName}
                        {isAI && (
                          <span className="bg-primary/10 text-primary border border-primary/20 text-[8px] font-bold px-1 rounded uppercase">Virtual</span>
                        )}
                        {isHumanMod && (
                          <span className="bg-[#c0c1ff]/20 text-[#c0c1ff] border border-[#c0c1ff]/20 text-[8px] font-bold px-1 rounded uppercase">Atendimento</span>
                        )}
                      </span>

                      {/* Chat text box */}
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-body border ${
                        isUser 
                          ? 'bg-primary/10 text-white border-primary/20 rounded-tr-none' 
                          : isAI 
                            ? 'bg-[#1a1e20] text-gray-200 border-white/5 rounded-tl-none'
                            : 'bg-[#151722] text-[#c0c1ff] border-[#c0c1ff]/15 rounded-tl-none font-bold'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>

                      <span className="text-[8px] font-mono text-[#bac9cd]/30 mt-1 px-1.5">{m.time}</span>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex flex-col items-start gap-1 max-w-[50%] mr-auto h-12">
                    <span className="text-[9px] font-mono text-on-surface-variant font-bold px-1.5">Análise Co-Piloto...</span>
                    <div className="flex gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/5 items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* INPUT BAR FOR SENDING DIRECT MSG */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-[#101415]/40 flex gap-2.5 items-center">
                <input
                  type="text"
                  required
                  placeholder={
                    activeTicket.status === 'resolved' 
                      ? 'Este chamado foi resolvido e arquivado comercialmente...' 
                      : (userRole === 'Admin' || userRole === 'Suporte')
                        ? 'Você está autenticado como suporte. Digite sua resposta oficial ao cliente...'
                        : activeTicket.status === 'human_mediation'
                          ? 'Escreva sua mensagem para o moderador Arthur...'
                          : 'Escreva sua dúvida técnico ou comercial para triagem de IA...'
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={activeTicket.status === 'resolved' || isSending}
                  className="bg-[#101415] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-primary flex-1 font-body text-xs"
                />

                <button
                  type="submit"
                  disabled={activeTicket.status === 'resolved' || isSending}
                  className="bg-primary text-black hover:scale-103 font-black px-4 py-3 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer border-none"
                  title="Enviar mensagem"
                >
                  <span className="material-symbols-outlined text-lg select-none">send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#bac9cd]/40">
              <span className="material-symbols-outlined text-5xl mb-3 select-none">support_agent</span>
              <h4 className="text-sm font-bold text-white">Nenhum chamado ativo</h4>
              <p className="text-[10px] max-w-xs mx-auto mt-1 leading-relaxed">Selecione um chamado histórico ou abra um novo ticket de suporte usando o botão superior.</p>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}
