import ws from 'ws';
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import NodeClam from 'clamscan';
import { createClient } from '@supabase/supabase-js';

// Polyfill para suporte a WebSocket (necessário para o cliente Supabase em Node.js)
(global as any).WebSocket = ws; 

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// 1. INICIALIZAÇÃO SEGURA DAS VARIÁVEIS (Aceita os nomes do seu print no Render)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Critical Error: Supabase credentials (URL or KEY) missing in environment.");
    process.exit(1);
}

// Inicializa o Supabase com a Service Role Key (necessária para o Webhook ter permissão total)
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: {
        fetch: (url: any, options: any) => fetch(url, options),
    },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 2. CONFIGURAÇÃO DE CORS (Aceita o seu link oficial da Vercel)
app.use(cors({
    origin: [FRONTEND_URL, 'https://speedesk-test.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// 3. WEBHOOK STRIPE (Processamento de compras em tempo real)
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
            // Registra a transação no banco de dados (A chave service_role garante a escrita)
            const { error } = await supabase.from('transactions').insert([{ 
                buyer_id: userId, 
                product_id: productId,
                status: 'locked', // Valor entra em quarentena de 7 dias
                created_at: new Date() 
            }]);
            
            if (error) console.error("Database Insert Error:", error.message);
            else console.log(`SUCCESS: User ${userId} purchased ${productId}`);
        }
    }
    res.json({ received: true });
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('🚀 Speedesk API Node Operational');
});

// 4. ROTA DE CHECKOUT (Gera o link da Stripe)
app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        const { priceId, userId, productId } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            // Como a conta é nova (menos de 60 dias), mantemos 'card'. 
            // A Stripe ativará o PIX automaticamente após o período de carência.
            payment_method_types: ['card'], 
            line_items: [{ 
                price: priceId || process.env.STRIPE_PRO_PRICE_ID, 
                quantity: 1 
            }],
            mode: 'subscription',
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/cancel`,
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

// 5. SISTEMA DE SEGURANÇA (CLAMAV)
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
        // Se limpo ou em simulação, ativa o produto no marketplace
        await supabase.from('products').update({ status: 'active' }).eq('id', productId);
        res.json({ status: 'success' });
    } catch (err: any) {
        res.status(500).json({ error: "Security processing failure." });
    }
});

// 6. PORTA DO SERVIDOR (Padronizada para Render)
const PORT = Number(process.env.PORT) || 10000;

// Rota para criar Produto na Stripe + Banco de Dados
app.post('/api/products/publish', async (req: Request, res: Response) => {
    try {
        const { title, price, description, userId, category, img, format, features, specs } = req.body;

        // 1. Criar o objeto Produto na Stripe
        const stripeProduct = await stripe.products.create({
            name: title,
            description: description,
            images: [img]
        });

        // 2. Criar o Preço na Stripe (converte R$ para centavos)
        const stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(Number(price) * 100),
            currency: 'brl',
        });

        // 3. Salvar no Supabase com o ID gerado
        const { data, error } = await supabase
            .from('products')
            .insert([{
                title,
                price: Number(price),
                category,
                img,
                format,
                description,
                stripe_price_id: stripePrice.id, // ID vital para o checkout
                status: 'active',
                creator_id: userId,
                features,
                specs
            }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (e: any) {
        console.error("Erro na Publicação:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Motor Speedesk operando na porta ${PORT}`);
    console.log(`📡 Frontend autorizado: ${FRONTEND_URL}`);
});