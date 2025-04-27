const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mode: 'test' ou 'production'
const MODE = 'test'; // Change simplement en 'production' après KYC validé

const CINETPAY_URL = MODE === 'test' 
  ? 'https://api-checkout.cinetpay.com/v2/payment' 
  : 'https://api-checkout.cinetpay.com/v2/payment';

const NOTIFY_URL = 'https://paiement-8fw3.onrender.com/notify';
const RETURN_URL = 'https://digitalschool025.systeme.io/413723d5';
const CANCEL_URL = 'https://digitalschool025.systeme.io/baae8ba1';

app.post('/pay', async (req, res) => {
  const { amount, customer_name, customer_surname, customer_email, customer_phone, country, mobile } = req.body;

  try {
    const response = await axios.post(CINETPAY_URL, {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: 'DS-' + Date.now(),
      amount: amount,
      currency: "USD",
      description: "Paiement de la formation Digital School",
      customer_name: customer_name,
      customer_surname: customer_surname,
      customer_email: customer_email,
      customer_phone_number: customer_phone,
      customer_address: "Adresse inconnue",
      customer_city: "Ville",
      customer_country: country,
      customer_state: "Etat",
      channels: "ALL",
      notify_url: NOTIFY_URL,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      lang: "fr"
    });

    res.json({ url: response.data.data.payment_url });
  } catch (error) {
    console.error('Erreur paiement:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Erreur lors de l\'initialisation du paiement.', details: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT} en mode ${MODE}`);
});
