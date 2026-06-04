import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 1. Carrega as variáveis do arquivo .env
dotenv.config();

const app = express();

// 2. Inicializa a Stripe usando a chave do .env
// O "!" no final diz ao TypeScript que temos certeza que a chave existe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// 3. Configura o CORS para aceitar chamadas do seu Frontend (Vite)
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

// ITEM 3: Rota de Checkout Profissional
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
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/cancel',
            // IMPORTANTE: Metadata vincula a venda ao usuário do seu banco de dados
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

// Webhook Stripe para confirmar pagamentos e gravar no Supabase
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
                }
            }

            res.json({ received: true });
        } catch (err: any) {
            console.error('Erro no webhook Stripe:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
);

// 4. Porta do Servidor (Usa o .env ou a 4242 por padrão)
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`🚀 Motor Speedesk Operacional na porta ${PORT}`);
    console.log(`🔗 Webhook deve apontar para: http://localhost:${PORT}/api/webhook`);
});