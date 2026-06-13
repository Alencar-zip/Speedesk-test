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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Critical Error: Supabase credentials missing.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { fetch: (url: any, options: any) => fetch(url, options) }
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: [FRONTEND_URL, 'https://speedesk-test.vercel.app', 'https://speedesk.vercel.app', 'http://localhost:5173'],
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
        }
    }
    res.json({ received: true });
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Speedesk API Node Operational');
});

// 4. ROTA DE CHECKOUT (Corrigida para aceitar compras únicas ou assinaturas)
app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        const { priceId, userId, productId, mode } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], 
            line_items: [{ price: priceId, quantity: 1 }],
            // 'payment' para ativos, 'subscription' para o plano PRO
            mode: mode || 'payment', 
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/cancel`,
            metadata: { 
                supabase_user_id: userId,
                product_id: productId 
            }
        });
        res.json({ url: session.url });
    } catch (e: any) {
        console.error("Stripe Checkout Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// ROTA DE PUBLICAÇÃO (Blindada contra links de imagem inválidos)
app.post('/api/products/publish', async (req: Request, res: Response) => {
    try {
        const { title, price, description, userId, category, img, format, features, specs } = req.body;
        let stripePriceId = null;

        // Só cria na Stripe se o preço for maior que zero
        if (Number(price) > 0) {
            const validImages = (img && img.startsWith('https')) ? [img] : [];
            const stripeProduct = await stripe.products.create({
                name: title,
                description: description.substring(0, 127),
                images: validImages
            });

            const stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.max(Math.round(Number(price) * 100), 50), 
                currency: 'brl',
            });
            stripePriceId = stripePrice.id;
        }

        const { data, error } = await supabase
            .from('products')
            .insert([{
                title,
                price: Number(price),
                category,
                img: img || "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
                format,
                description,
                stripe_price_id: stripePriceId, // Pode ser null se for gratis
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
        console.error("Erro na Publicacao:", e.message);
        res.status(500).json({ error: e.message });
    }
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});