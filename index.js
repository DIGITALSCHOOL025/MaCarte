const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Pour envoyer des requêtes HTTP
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Clés d'API CinetPay (à remplacer par les tiennes en mode test)
const API_KEY = '1566511865680bd456ab25f7.01839391';   // Clé API en mode test
const SITE_ID = '105893277';   // ID de ton site en mode test
const SECRET_KEY = '130960285680bd5b149c2a9.59159569';  // Mot de passe secret en mode test

// URL pour recevoir les notifications
const NOTIFY_URL = 'https://cinetpay-paiement.onrender.com/notify';  // URL pour recevoir la notification
const RETURN_URL = 'https://digitalschool025.systeme.io/413723d5'; // URL de redirection après paiement réussi
const CANCEL_URL = 'https://digitalschool025.systeme.io/baae8ba1'; // URL de redirection après annulation

// Route pour initier un paiement
app.post('/pay', async (req, res) => {
  const { amount, customer_name, customer_surname, customer_email, customer_phone } = req.body;

  const paymentData = {
    api_key: API_KEY,
    site_id: SITE_ID,
    amount: amount, // Montant du paiement
    currency: 'USD', // Devise (CFA ou autre selon le pays)
    customer_name: customer_name,
    customer_surname: customer_surname,
    customer_email: customer_email,
    customer_phone_number: customer_phone,
    return_url: RETURN_URL,
    cancel_url: CANCEL_URL,
    notify_url: NOTIFY_URL,
    secret_key: SECRET_KEY // Mot de passe secret
  };

  // Envoi de la requête à CinetPay pour initier le paiement
  try {
    const response = await fetch('https://sandbox.cinetpay.com/v1/payment/initiate', {  // Utilise l'URL sandbox ici
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    // Si la réponse contient l'URL de paiement, redirige l'utilisateur
    if (data.url) {
      res.json({ url: data.url });
    } else {
      res.status(500).json({ message: 'Erreur lors de l\'initialisation du paiement.' });
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur de connexion au serveur.' });
  }
});

// Route pour recevoir la notification de paiement
app.post('/notify', (req, res) => {
  const notification = req.body;

  console.log('Notification reçue:', notification);

  // Traitement de la notification, par exemple mettre à jour le statut du paiement dans ta base de données
  if (notification.status === 'SUCCESS') {
    // Traitement du paiement réussi
    console.log('Paiement réussi');
  } else {
    // Traitement en cas d'échec
    console.log('Paiement échoué');
  }

  res.status(200).send('Notification reçue');
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur backend en écoute sur http://localhost:${port}`);
});
