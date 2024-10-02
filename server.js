const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe('sk_test_51Q5GPFFokBZMd6H1E01OdXlxHLIUL43WLLpsKg5DYeqC1CYEmyPopQGHGg1hoKoqiXSW36Cr19EGgh4aAzDmWBN6001VmKVZud');
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { name, price, imageUrl } = req.body; // Get item details from the request

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: name,
              images: [imageUrl], // Optional: Show the image on the checkout page
            },
            unit_amount: Math.round(price * 100), // Stripe expects the price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/shop/success', // Redirect after successful payment
      cancel_url: 'http://localhost:3000/shop/cancel',
    });
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log('Server running on http://localhost:4242'));
