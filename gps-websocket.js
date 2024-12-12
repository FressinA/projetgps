const WebSocket = require('ws');

// Créer un serveur WebSocket
const wss = new WebSocket.Server({ port: 3001 });

console.log('Serveur WebSocket en écoute sur ws://localhost:3001');

// Gestion des connexions clients
wss.on('connection', (ws) => {
  console.log('Client connecté');

  // Envoyer un message au client
  ws.send(JSON.stringify({ message: 'Connexion établie avec succès!' }));

  // Réception de messages du client
  ws.on('message', (message) => {
    console.log(`Message reçu du client : ${message}`);
  });

  // Envoi périodique de données (exemple : données GPS)
  const interval = setInterval(() => {
    const gpsData = {
      latitude: (Math.random() * 180 - 90).toFixed(6), // Exemple de latitude
      longitude: (Math.random() * 360 - 180).toFixed(6), // Exemple de longitude
    };
    ws.send(JSON.stringify(gpsData));
  }, 1000);

  // Gérer la déconnexion du client
  ws.on('close', () => {
    console.log('Client déconnecté');
    clearInterval(interval);
  });
});
