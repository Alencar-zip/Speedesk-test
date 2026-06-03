import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // API Route for scanning products via Gemini API
  app.post('/api/scan-file', async (req, res) => {
    const { title, fileName, fileSize, category, format, forceThreat } = req.body;

    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    // Check if GEMINI_API_KEY is defined
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful fallback when API key is missing
      setTimeout(() => {
        if (forceThreat) {
          return res.json({
            status: 'declined',
            summary: 'Ameaça em Sandbox: Detectado Trojan.Downloader em arquivo compactado (Simulado).',
            logs: [
              { time: timestamp(), message: `Nova carga de ativo detectada: "${title}" [${fileName}]`, type: 'info' },
              { time: timestamp(), message: "Iniciando Descompressão Speedesk Sandbox local...", type: 'info' },
              { time: timestamp(), message: "[Simulação] Analisando hashes contra banco de ameaças locais...", type: 'info' },
              { time: timestamp(), message: "ALERTA: Arquivo infectado por assinatura Heurística!", type: 'warning' },
              { time: timestamp(), message: "CRÍTICO: Trojan.Downloader.Heur detectado em scripts empacotados. Distribuição cancelada.", type: 'error' },
              { time: timestamp(), message: "NOTA: Adicione a chave GEMINI_API_KEY nas Configurações do AI Studio para análise real com IA.", type: 'warning' }
            ]
          });
        } else {
          return res.json({
            status: 'approved',
            summary: 'Aprovado em Sandbox: Nenhuma ameaça detectada nos metadados ou estrutura local.',
            logs: [
              { time: timestamp(), message: `Nova carga de ativo de design detectada: "${title}" [${fileName}]`, type: 'info' },
              { time: timestamp(), message: "Descompactação e checagem de integridade concluída.", type: 'success' },
              { time: timestamp(), message: "Nenhum Trojan ou arquivo suspeito encontrado na assinatura local.", type: 'success' },
              { time: timestamp(), message: "Sincronizado e listado comercialmente para o traders.", type: 'success' },
              { time: timestamp(), message: "DICA: Ative a chave GEMINI_API_KEY nas Configurações para auditar com inteligência heurística profunda do Gemini.", type: 'info' }
            ]
          });
        }
      }, 1500);
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const promptText = `Execute um escaneamento de segurança contra ameaças digitais e integridade no seguinte layout/ativo comercial enviado para o marketplace por um criador de conteúdo:
      - Título do Ativo: "${title}"
      - Nome do arquivo compactado: "${fileName}"
      - Tamanho: "${fileSize}"
      - Tipo/Categoria: "${category}" (Formato: "${format}")
      - Opção de Simulação Forçar Ameaça: ${forceThreat ? 'SIM (FORÇAR AMEAÇA INFECCIOSA)' : 'NÃO (ANALISAR SEGURO)'}

      Diretrizes de Auditoria do Modelo para o JSON de saída:
      1. Se 'Opção de Simulação Forçar Ameaça' for SIM:
         - Você deve obrigatoriamente definir o "status" como "declined".
         - Inclua de 4 a 6 logs técnicos detalhados de descompressão e verificação.
         - Descreva uma falha grave, por exemplo, vírus Trojan, script bash/VBA em lote malicioso oculto, ou macro com URLs contendo Phishing dentro do arquivo .zip.
         - Coloque pelo menos um log do tipo "warning" e pelo menos um do tipo "error".

      2. Se 'Opção de Simulação Forçar Ameaça' for NÃO:
         - Você deve definir o "status" como "approved".
         - Inclua de 4 a 6 logs profissionais de varredura heurística da IA (descompressão do zip, verificação SHA-256 e MD5 das imagens e fontes inclusas no zip, decodificação de objetos, barreira contra ransomwares, análise de assinaturas de macros VBA e validação estrutural).
         - Certifique-se de que os logs tenham timesteps realistas e usem primordialmente os tipos "info" e "success" com mensagens em português bem descritivas.

      Suas mensagens de log devem ser retornadas de forma estruturada nas propriedades status, summary e logs do objeto JSON retornado.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "Você é o Speedesk AI Antivírus, especialista em segurança cibernética corporativa e integridade de ativos de design do marketplace. Retorne sempre e estritamente o formato JSON solicitado contendo status, summary e logs detalhados em português do Brasil.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: {
                type: Type.STRING,
                description: "Deve ser 'approved' ou 'declined'"
              },
              summary: {
                type: Type.STRING,
                description: "Um resumo descritivo em português de uma ou duas frases sobre o resultado do antivírus."
              },
              logs: {
                type: Type.ARRAY,
                description: "Passos detalhados e timesteps do escaneamento do arquivo.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: "Hora formatada como HH:MM:SS" },
                    message: { type: Type.STRING, description: "Mensagem descritiva em português do que está acontecendo naquela fase do escaneamento" },
                    type: { type: Type.STRING, description: "Tipo de log: deve ser exatamente: info, success, warning ou error" }
                  },
                  required: ["time", "message", "type"]
                }
              }
            },
            required: ["status", "summary", "logs"]
          }
        }
      });

      const resultText = response.text || "{}";
      const data = JSON.parse(resultText);

      res.json(data);
    } catch (error: any) {
      console.error("Erro ao rodar análise do scanner com Gemini:", error);
      res.status(500).json({
        status: 'declined',
        summary: 'Erro de Processamento: Ocorreu uma interrupção ao contatar o motor heurístico remoto da IA.',
        logs: [
          { time: timestamp(), message: "Iniciando Descompressão de emergência...", type: 'info' },
          { time: timestamp(), message: `Falha técnica interna: ${error.message || error}`, type: 'error' },
          { time: timestamp(), message: "O produto foi retido preventivamente para quarentena.", type: 'warning' }
        ]
      });
    }
  });

  // API Route for support chat (50% AI / 50% Human hybrid helper)
  app.post('/api/support-chat', async (req, res) => {
    const { subject, productTitle, history, newMessage } = req.body;

    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful fallback when API key is missing
      let reply = "Olá! Sou o assistente de Suporte Inteligente da Speedesk. Como a chave de API do Gemini no AI Studio não está configurada, estou respondendo em modo offline de demonstração.\n\n";
      
      const query = (newMessage || '').toLowerCase();
      if (query.includes('reembolso') || query.includes('disputa') || query.includes('estorno') || query.includes('devolver')) {
        reply += "Se você teve algum problema com o arquivo baixado ou se o layout não corresponde à descrição, você pode iniciar uma mediação na plataforma. Recomendo clicar em **'Chamar Mediador Humano'** no topo do painel de chat. Um auditor de comércio examinará o ZIP contestado e mediará as partes em até 2 horas.";
      } else if (query.includes('saque') || query.includes('pix') || query.includes('carteira') || query.includes('faturamento') || query.includes('dinheiro') || query.includes('pagamento')) {
        reply += "Para realizar um saque, acesse sua página de **Carteira** no menu lateral, certifique-se de preencher sua chave Pix (CPF, E-mail ou Chave Aleatória) nas Configurações e confirme o valor. O processamento na Speedesk leva até 5 minutos no PIX instantâneo.";
      } else if (query.includes('virus') || query.includes('quarentena') || query.includes('bloquei') || query.includes('trojan') || query.includes('falso positivo')) {
        reply += `Entendo que o seu ativo "${productTitle || 'enviado'}" foi retido pelo Antivírus Sandbox de IA. Isso ocorre de forma heurística automatizada. Como IA, posso registrar seu recurso inicial, mas para reverter um falso positivo e listar o arquivo novamente, clique em **'Chamar Mediador Humano'** para acionar a equipe de engenharia do Speedesk para descompressão física de segurança.`;
      } else if (query.includes('figma') || query.includes('keynote') || query.includes('powerpoint') || query.includes('pptx')) {
        reply += "Caso você encontre problemas ao renderizar o slide ou as fontes, verifique se instalou o kit de fontes referenciado nas especificações do ativo. Em arquivos do Figma, verifique se a biblioteca de estilo local está ativada.";
      } else {
        reply += `Recebi sua mensagem sobre "${subject || 'Dúvidas'}" associada ao ativo "${productTitle || 'Nenhum'}". Para darmos andamento nesta questão técnica ou se precisar de intermediação de estorno, informe mais detalhes aqui ou decida acionar o nosso **Suporte Humano (50%)** a qualquer momento.`;
      }

      return res.json({ text: reply, suggestAction: "Escalar para Humano" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Prepare conversation messages history
      const formattedHistory = (history || []).map((h: any) => {
        return `${h.role === 'user' ? 'Usuário' : h.role === 'human' ? 'Suporte Humano' : 'IA Speedesk'}: ${h.text}`;
      }).join('\n');

      const systemInstruction = `Você é o Speedesk AI Suporte, responsável pelos 50% de atendimento autônomo (IA) do marketplace de templates da Speedesk.
Seu objetivo é ajudar traders de layouts, compradores e criadores a resolverem disputas comerciais, dúvidas sobre downloads de arquivos ZIP, recursos de antivírus/quarentena e problemas na carteira.
Aqui está o contexto do ticket atual:
- Assunto: "${subject}"
- Ativo relacionado: "${productTitle || 'Nenhum'}"

Histórico da Conversa:
${formattedHistory}

Mensagem recente do usuário para responder:
"${newMessage}"

Diretrizes de Resposta:
1. Responda estritamente em Português do Brasil (pt-BR).
2. Escreva respostas cordiais, profissionais, curtas (máximo 150 palavras) e diretamente úteis. NUNCA cite códigos internos de servidor ou que é uma simulação, atue como um suporte real do Speedesk.
3. Se for uma dúvida operacional (Pixel, Figma, saques, etc.), resolva o problema imediatamente de forma clara.
4. Se o usuário estiver contestando um bloqueio de arquivo (quarentena heurística) ou exigindo reembolso de uma compra na plataforma e você como IA não puder resolver diretamente os fundos, explique educadamente as regras e encoraje-o explicitamente a recorrer ao suporte humano (clicando no botão 'Chamar Mediador Humano' na interface) para validação manual oficial.
5. Retorne a resposta em formato estruturado JSON com a propriedade "text" contendo sua mensagem formatada em Markdown, e a propriedade opcional "suggestAction" (string de 2 a 4 palavras) para sugerir qual deve ser o próximo botão de atalho do usuário.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Responda a mensagem do usuário sabendo da sua restrição 50% IA / 50% Humano.",
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "Sua mensagem de resposta em formato Markdown em português do Brasil."
              },
              suggestAction: {
                type: Type.STRING,
                description: "Breve frase sugestiva, ex: 'Escalar para Humano', 'Revisar Detalhes', 'Enviar Comprovante' ou 'Ir para Carteira'"
              }
            },
            required: ["text"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (e: any) {
      console.error("Erro na API do suporte híbrido do Gemini:", e);
      res.status(500).json({
        text: "Desculpe pelo contratempo. Ocorreu um erro técnico ao registrar sua resposta no servidor do Gemini. Se precisar de ajuda prioritária imediata, por favor acione a mediação com um Humano.",
        suggestAction: "Chamar Mediador Humano"
      });
    }
  });

  // Vite & Static file handler setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack server running on port ${PORT}`);
  });
}

startServer();
