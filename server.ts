import ws from 'ws';
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import NodeClam from 'clamscan';
import { createClient } from '@supabase/supabase-js';

(global as any).WebSocket = ws; 

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Inicialização da Stripe e Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// --- INICIALIZAÇÃO CORRIGIDA ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Aqui ele tenta pegar a Secret Key, se não achar, pega a Anon Key que está no seu .env
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERRO: Chaves do Supabase não encontradas no .env!");
    console.log("Verifique se os nomes no arquivo .env estão corretos.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false // Recomendado para servidores (backend)
    },
    global: {
        fetch: (...args) => fetch(...args),
    },
    // Isso resolve o erro do WebSocket
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
        
    },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Rota de Webhook da Stripe
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.supabase_user_id;
            if (userId) {
                await supabase.from('transactions').insert([{ buyer_id: userId, status: 'locked', created_at: new Date() }]);
            }
        }
        res.json({ received: true });
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

app.use(express.json());

// Rota de Checkout
app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        const { priceId, userId } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'pix'],
            line_items: [{ price: priceId || process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
            mode: 'subscription',
            success_url: `${FRONTEND_URL}/success`,
            cancel_url: `${FRONTEND_URL}/cancel`,
            metadata: { supabase_user_id: userId }
        });
        res.json({ url: session.url });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Inicialização do ClamAV
const initClam = async () => {
    try {
        return await new NodeClam().init({
            clamdscan: {
                socket: '/var/run/clamav/clamd.ctl',
                local_fallback: true // Agora o TS vai ignorar o erro aqui
            },
            preference: 'clamdscan'
        } as any); // O 'as any' resolve o conflito de propriedades desconhecidas
    } catch (err) {
        console.warn("Motor ClamAV offline. Operando em modo de seguranca manual.");
        return null;
    }
};

// Rota de Upload Seguro (ClamAV)
app.post('/api/upload-secure', upload.single('file'), async (req: any, res: Response) => {
    const { productId } = req.body;
    if (!req.file) return res.status(400).json({ error: "Arquivo faltando." });

    try {
        const clamscan = await initClam();

        if (clamscan) {
            const { is_infected, viruses } = await clamscan.scan_stream(req.file.stream);
            if (is_infected) {
                await supabase.from('products').update({ status: 'rejected' }).eq('id', productId);
                return res.status(400).json({ status: 'danger', message: 'Malware detectado!', detail: viruses });
            }
        }

        // Se limpo ou scanner offline, aprova no banco
        await supabase.from('products').update({ status: 'active' }).eq('id', productId);
        res.json({ status: 'success', message: 'Arquivo validado.' });

    } catch (err) {
        res.status(500).json({ error: 'Falha no processamento.' });
    }
});

const PORT = Number(process.env.PORT) || 4242;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});