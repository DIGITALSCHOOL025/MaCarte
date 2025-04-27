const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MODE = 'test'; // change à 'production' après KYC validé

const CINETPAY_URL = MODE === 'test'
  ? 'https://api-checkout.cinetpay.com/v2/payment'
  : 'https://api-checkout.cinetpay.com/v2/payment';

const NOTIFY_URL = 'https://paiement-8fw3.onrender.com/notify';
const RETURN_URL = 'https://digitalschool025.systeme.io/413723d5';
const CANCEL_URL = 'https://digitalschool025.systeme.io/baae8ba1';

app.post('/pay', async (req, res) => {
  const { amount, customer_name, customer_surname, customer_email, customer_phone, country, mobile } = req.body;

  // Contrôler et forcer les bonnes valeurs
  const validatedCountry = (country || 'CD').toUpperCase(); // Par défaut RDC si non fourni
  const validatedChannel = ['ALL', 'MOBILE_MONEY', 'WALLET', 'CREDIT_CARD'].includes(mobile)
    ? mobile
    : 'MOBILE_MONEY'; // Force MOBILE_MONEY si erreur

  try {
    const response = await axios.post(CINETPAY_URL, {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: 'DS-' + Date.now(),
      amount: amount,
      currency: "USD",
      description: "Paiement de la formation Digital School",
      customer_name: customer_name || "Client",
      customer_surname: customer_surname || "DigitalSchool",
      customer_email: customer_email || "client@example.com",
      customer_phone_number: customer_phone,
      customer_address: "Adresse inconnue",
      customer_city: "Kinshasa",
      customer_country: validatedCountry,
      customer_state: "Etat",
      channels: validatedChannel,
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
