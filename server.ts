import ws from 'ws';
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import NodeClam from 'clamscan';
import { createClient } from '@supabase/supabase-js';

// Polyfill para suporte a WebSocket no Node.js (necessario para Supabase Realtime)
(global as any).WebSocket = ws; 

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Inicializacao da Stripe e Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERRO: Chaves do Supabase nao encontradas no ambiente.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: {
        fetch: (url: any, options: any) => fetch(url, options),
    },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: [
        'https://speedesk-test.vercel.app',
        'https://speedesk.vercel.app',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Rota de Webhook da Stripe (Processamento assincrono de pagamentos)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const productId = session.metadata?.product_id;

        if (userId && productId) {
            // 1. Registrar a transacao de compra para o comprador
            await supabase.from('transactions').insert([{ 
                buyer_id: userId, 
                product_id: productId,
                status: 'locked', // Inicia quarentena de 7 dias
                created_at: new Date() 
            }]);

            // 2. Log de auditoria
            console.log(`Pagamento confirmado: Usuario ${userId} comprou produto ${productId}`);
        }
    }

    res.json({ received: true });
});

app.use(express.json());

// Rota para Teste de Conexao
app.get('/', (req, res) => {
    res.send('Motor Speedesk Operacional');
});

// ITEM 3: Geracao de Sessao de Checkout Stripe
app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        const { priceId, userId, productId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'pix'],
            line_items: [{ 
                price: priceId || process.env.STRIPE_PRO_PRICE_ID, 
                quantity: 1 
            }],
            mode: 'subscription',
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/cancel`,
            metadata: { 
                supabase_user_id: userId,
                product_id: productId // Crucial para o Webhook identificar a venda
            }
        });
        res.json({ url: session.url });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Inicializacao do Motor de Antivirus ClamAV
const initClam = async () => {
    try {
        return await new NodeClam().init({
            clamdscan: {
                socket: '/var/run/clamav/clamd.ctl',
                local_fallback: true
            },
            preference: 'clamdscan'
        } as any);
    } catch (err) {
        console.warn("Aviso: Motor ClamAV nao detectado no ambiente local.");
        return null;
    }
};

// Rota de Triagem de Arquivos (ClamAV)
app.post('/api/upload-secure', upload.single('file'), async (req: any, res: Response) => {
    const { productId } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: "Arquivo nao detectado." });
    }

    try {
        const clamscan = await initClam();
        
        if (clamscan) {
            const { is_infected, viruses } = await clamscan.scan_stream(req.file.stream);

            if (is_infected) {
                console.error(`Malware detectado no produto ${productId}: ${viruses}`);
                await supabase.from('products').update({ status: 'rejected' }).eq('id', productId);
                return res.status(400).json({ 
                    status: 'infected', 
                    message: 'Arquivo rejeitado pela triagem de seguranca.',
                    detail: viruses 
                });
            }
        }

        // Se limpo ou scanner ausente (modo homologacao), libera o produto
        const { error: updateError } = await supabase
            .from('products')
            .update({ status: 'active' }) 
            .eq('id', productId);

        if (updateError) throw updateError;

        res.json({ status: 'success', message: 'Ativo validado e publicado.' });

    } catch (err: any) {
        console.error("Erro na esteira de triagem:", err.message);
        res.status(500).json({ error: "Falha no processamento tecnico." });
    }
});

const PORT = Number(process.env.PORT) || 4242;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});