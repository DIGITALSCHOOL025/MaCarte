// --- Chargement des modules nécessaires ---
const express = require('express'); // Express pour créer un serveur web
const axios = require('axios');     // Axios pour faire des requêtes HTTP (vers CinetPay)
const cors = require('cors');       // CORS pour accepter les appels depuis d'autres domaines

const app = express();
app.use(cors()); // Autorise tout le monde à appeler ton serveur
app.use(express.json()); // Permet de lire le JSON dans les requêtes

// --- Configuration de CinetPay ---
// !!! Remplacer les valeurs ici par les tiennes (API_KEY, SITE_ID)
const API_KEY = '1566511865680bd456ab25f7.01839391';  
const SITE_ID = '105893277';
const CURRENCY = 'CDF'; // Devise : XOF (FCFA) ou CDF pour le Congo
const BASE_CINETPAY_URL = 'https://api-checkout.cinetpay.com/v2/payment';

// URL de redirection après paiement (succès ou échec)
// !!! Modifier ici pour mettre tes vraies pages Systeme.io
const RETURN_URL = 'https://ton-lien-systeme-io-page-remerciement'; // Paiement réussi
const CANCEL_URL = 'https://digitalschool025.systeme.io/baae8ba1'; // Paiement annulé ou échoué

// --- Fonction pour générer un ID unique pour chaque transaction ---
const generateTransactionId = () => {
  return 'txn_' + Date.now(); // Exemple : txn_1714295458301
};

// --- Point d'entrée pour démarrer un paiement ---
app.post('/pay', async (req, res) => {
  try {
    // Données envoyées depuis la page web
    const { amount, customer_name, customer_surname, customer_email, customer_phone } = req.body;

    const transaction_id = generateTransactionId(); // Générer un nouveau ID unique

    const payload = {
      apikey: API_KEY,
      site_id: SITE_ID,
      transaction_id: transaction_id,
      amount: amount,
      currency: CURRENCY,
      description: "Paiement sur ma plateforme",
      return_url: RETURN_URL,
      notify_url: "https://cinetpay-paiement.onrender.com/notify", // Notification serveur à serveur
      cancel_url: CANCEL_URL,
      metadata: "Paiement systeme.io",
      customer_name: customer_name || "client",
      customer_surname: customer_surname || "default",
      customer_email: customer_email || "client@example.com",
      customer_phone_number: customer_phone || "0000000000",
      mode: "TEST" // IMPORTANT : reste en mode TEST tant que ton compte n'est pas validé
    };

    // Appel vers CinetPay pour créer la transaction
    const response = await axios.post(BASE_CINETPAY_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Réponse de CinetPay
    if (response.data.code === '201') {
      const paymentUrl = response.data.data.payment_url;
      res.json({ url: paymentUrl }); // On renvoie l'URL de paiement au navigateur
    } else {
      res.status(400).json({ message: response.data.message });
    }
  } catch (error) {
    console.error('Erreur lors du paiement:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Erreur serveur interne' });
  }
});

// --- Endpoint pour recevoir la notification de CinetPay (optionnel pour automatisation) ---
app.post('/notify', (req, res) => {
  console.log('Notification reçue:', req.body); // Tu pourras traiter ça plus tard
  res.status(200).send('OK'); // On confirme réception à CinetPay
});

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 3000; // Render choisira automatiquement le port
app.listen(PORT, () => {
  console.log(`Serveur backend CinetPay démarré sur le port ${PORT}`);
});
