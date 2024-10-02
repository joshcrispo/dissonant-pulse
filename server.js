const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe('sk_test_51Q5GPFFokBZMd6H1E01OdXlxHLIUL43WLLpsKg5DYeqC1CYEmyPopQGHGg1hoKoqiXSW36Cr19EGgh4aAzDmWBN6001VmKVZud');
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { name, price, imageUrl, type } = req.body; 

  try {
    const successUrl = type === 'event' ? `http://localhost:3000/events/success?itemName=${encodeURIComponent(name)}&itemType=${type}` : `http://localhost:3000/shop/success?itemName=${encodeURIComponent(name)}&itemType=${type}`;
    const cancelUrl = type === 'event' ? `http://localhost:3000/events/cancel?itemName=${encodeURIComponent(name)}&itemType=${type}` : `http://localhost:3000/shop/cancel?itemName=${encodeURIComponent(name)}&itemType=${type}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: name,
              images: [imageUrl],
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl, 
      cancel_url: cancelUrl,
    });
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log('Server running on http://localhost:4242'));
