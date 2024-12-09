const express = require('express'); // Pour créer une API REST ou serveur web
const app = express();
const PORT = 3000;

const { ReadlineParser } = require('@serialport/parser-readline'); // Changement ici
const { SerialPort } = require('serialport');
const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' })); // Utilisation du parser ici

// Écoute des données depuis le port série
parser.on('data', (data) => {
  console.log(`Données reçues : ${data}`);
});

// Démarrer un serveur web
app.get('/', (req, res) => {
  res.send('Serveur Node.js prêt à recevoir des données');
});

// Serveur HTTP sur le port 3000
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
