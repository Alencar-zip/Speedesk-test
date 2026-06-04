import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. Carrega as variáveis do arquivo .env
dotenv.config();

const app = express();

// 2. Inicializa a Stripe usando a chave do .env
// O "!" no final diz ao TypeScript que temos certeza que a chave existe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

// 4. Porta do Servidor (Usa o .env ou a 4242 por padrão)
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`🚀 Motor Speedesk Operacional na porta ${PORT}`);
    console.log(`🔗 Webhook deve apontar para: http://localhost:${PORT}/api/webhook`);
});