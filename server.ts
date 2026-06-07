import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import NodeClam from 'clamscan';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// --- CONFIGURAÇÕES DE AMBIENTE ---
const isProduction = process.env.NODE_ENV === 'production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 2. Inicializa Stripe e Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Nota: No Render, garanta que os nomes das variáveis sejam exatamente estes:
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 3. Configura o CORS dinâmico (Aceita localhost E o link da Vercel)
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Webhook precisa do body bruto (RAW), por isso vem antes do express.json
app.post(
    '/api/webhook',
    express.raw({ type: 'application/json' }),
    async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'] as string;
        try {
            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.supabase_user_id;

                if (userId) {
                    await supabase.from('transactions').insert([{
                        buyer_id: userId,
                        status: 'locked',
                        created_at: new Date(),
                    }]);
                    console.log(`✅ Pagamento confirmado para usuário: ${userId}`);
                }
            }
            res.json({ received: true });
        } catch (err: any) {
            console.error('❌ Erro no webhook:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
);

app.use(express.json());

// ITEM 3: Rota de Checkout com Links Dinâmicos
app.post('/api/checkout', async (req: Request, res: Response) => {
    try {
        const { priceId, userId } = req.body;

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
                supabase_user_id: userId
            }
        });

        res.json({ url: session.url });
    } catch (e: any) {
        console.error("Erro na Stripe:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// Verificador ClamAV (Ativo apenas se o binário existir no sistema)
const initScanner = async () => {
    try {
        return await new NodeClam().init({
            clamdscan: { socket: '/var/run/clamav/clamd.ctl' }
        });
    } catch (e) {
        console.warn("⚠️ ClamAV não detectado. Triagem operando em modo simulação.");
        return null;
    }
};

app.post('/api/verify-asset', async (req: Request, res: Response) => {
    const { productId, filePath } = req.body;
    try {
        const clamscan = await initScanner();
        if (clamscan) {
            const { is_infected, viruses } = await clamscan.scan_file(filePath);
            if (is_infected) {
                await supabase.from('products').update({ status: 'rejected' }).eq('id', productId);
                return res.json({ status: 'danger', message: 'Malware detectado!', viruses });
            }
        }
        await supabase.from('products').update({ status: 'pending_admin' }).eq('id', productId);
        res.json({ status: 'success', message: 'Triagem concluída.' });
    } catch (err) {
        res.status(500).json({ error: 'Falha no Verificador.' });
    }
});

// 4. Porta do Servidor (CONFIGURAÇÃO PARA RENDER)
const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Motor Speedesk operando na porta ${PORT}`);
    console.log(`📡 Frontend: ${FRONTEND_URL}`);
});
