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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Uso da Service Role Key no backend para garantir permissao de escrita no webhook
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Critical Error: Supabase credentials missing in environment.");
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
    origin: [FRONTEND_URL, 'https://speedesk-test.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
}));

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
            await supabase.from('transactions').insert([{ 
                buyer_id: userId, 
                product_id: productId,
                status: 'locked', 
                created_at: new Date() 
            }]);
            console.log(`Transaction logged: User ${userId} purchased Product ${productId}`);
        }
    }
    res.json({ received: true });
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Speedesk API Node Operational');
});

// server.ts
app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        const { priceId, userId, productId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            // 'automatic_payment_methods' permite que a Stripe decida o que mostrar 
            // com base no que esta ativo no seu painel (Settings > Payment Methods)
            payment_method_types: ['card'], // Como o PIX esta bloqueado por 60 dias, mantemos apenas card aqui para evitar erros
            line_items: [{ 
                price: priceId || process.env.STRIPE_PRO_PRICE_ID, 
                quantity: 1 
            }],
            mode: 'subscription', // Use 'payment' se o produto for compra unica
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: { 
                supabase_user_id: userId,
                product_id: productId 
            }
        });

        res.json({ url: session.url });
    } catch (e: any) {
        console.error("Stripe Session Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

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
        console.warn("ClamAV engine not detected. Running in simulation mode.");
        return null;
    }
};

app.post('/api/upload-secure', upload.single('file'), async (req: any, res: Response) => {
    const { productId } = req.body;
    if (!req.file) return res.status(400).json({ error: "Missing file." });

    try {
        const clamscan = await initClam();
        if (clamscan) {
            const { is_infected, viruses } = await clamscan.scan_stream(req.file.stream);
            if (is_infected) {
                await supabase.from('products').update({ status: 'rejected' }).eq('id', productId);
                return res.status(400).json({ status: 'infected', detail: viruses });
            }
        }
        await supabase.from('products').update({ status: 'active' }).eq('id', productId);
        res.json({ status: 'success' });
    } catch (err: any) {
        res.status(500).json({ error: "Security processing failure." });
    }
});

const PORT = Number(process.env.PORT) || 4242;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});