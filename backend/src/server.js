import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'xijum-backend',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'Items are required.' });
    }

    const line_items = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: item.currency?.toLowerCase() || 'mxn',
        product_data: {
          name: item.name
        },
        unit_amount: Math.round(Number(item.price) * 100)
      }
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${process.env.FRONTEND_URL}/pages/success-v2.html`,
      cancel_url: `${process.env.FRONTEND_URL}/pages/checkout-v2.html`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return res.status(500).json({ error: 'Unable to create checkout session.' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});


