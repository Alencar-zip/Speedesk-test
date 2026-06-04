import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const stripe = new Stripe('sk_test_COLOQUE_SUA_CHAVE_AQUI'); // Use sua chave sk_test

app.use(cors());
app.use(express.json());

app.post('/api/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'pix'],
            line_items: [{ price: 'price_1TeDXZQ3BpaRaOV8DsM4XODS', quantity: 1 }],
            mode: 'subscription',
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/cancel',
        });
        res.json({ url: session.url });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(4242, () => console.log('Motor financeiro rodando na porta 4242'));