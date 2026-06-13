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
// server.ts - SUBSTITUA A ROTA /api/checkout POR ESTA

app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        const { priceId, userId, productId, mode, priceAmount } = req.body;
        
        let line_items;

        // Se veio um valor manual (Carteira), criamos o preco na hora
        if (priceAmount && !priceId) {
            const tempPrice = await stripe.prices.create({
                currency: 'brl',
                unit_amount: Math.round(priceAmount * 100),
                product_data: { name: 'Recarga de Saldo Speedesk' },
            });
            line_items = [{ price: tempPrice.id, quantity: 1 }];
        } else {
            // Se veio um produto da loja ou assinatura PRO
            line_items = [{ price: priceId || process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }];
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: mode || 'payment', 
            success_url: `${FRONTEND_URL}/success`,
            cancel_url: `${FRONTEND_URL}/cancel`,
            metadata: { 
                supabase_user_id: userId,
                product_id: productId || 'wallet_topup'
            }
        });

        res.json({ url: session.url });
    } catch (e: any) {
        console.error("ERRO STRIPE:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// ROTA DE PUBLICAÇÃO (Blindada contra links de imagem inválidos)
app.post('/api/products/publish', async (req: Request, res: Response) => {
    try {
        // 1. Adicionamos 'file_path' na lista de coisas que o servidor recebe
        const { title, price, description, userId, category, img, format, features, specs, file_path } = req.body;
        let stripePriceId = null;

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

        // 2. Incluimos o 'file_path' no comando de salvar no banco
        const { data, error } = await supabase
            .from('products')
            .insert([{
                title,
                price: Number(price),
                category,
                img: img || "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
                format,
                description,
                stripe_price_id: stripePriceId,
                status: 'active',
                creator_id: userId,
                features,
                specs,
                file_path: file_path // <--- ADICIONE ESTA LINHA
            }])
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (e: any) {
        console.error("Falha na publicacao:", e.message);
        res.status(500).json({ error: e.message });
    }
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});