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

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Variables pour stocker les données GPS extraites
let latitude = null;
let longitude = null;
let altitude = null;

// Fonction pour parser une trame GPS
function parseGPSData(data) {
  // Exemple de trame GPGGA : $GPGGA,123456.00,4916.45,N,12311.12,W,1,08,1.0,10.0,M,-33.0,M,,*48
  const parts = data.split(',');

  if (parts[0] === '$GPGGA') {
    latitude = parseCoordinate(parts[2], parts[3]); // Latitude
    longitude = parseCoordinate(parts[4], parts[5]); // Longitude
    altitude = parts[9]; // Altitude (en mètres)
  }
}

// Fonction pour convertir une coordonnée en degré décimal
function parseCoordinate(coordinate, direction) {
  const degrees = parseFloat(coordinate.slice(0, coordinate.length - 7));
  const minutes = parseFloat(coordinate.slice(coordinate.length - 7));

  let decimalCoord = degrees + minutes / 60;
  if (direction === 'S' || direction === 'W') {
    decimalCoord *= -1; // Les coordonnées sud et ouest sont négatives
  }

  return decimalCoord;
}

// Écoute des données depuis le port série (trames GPS)
parser.on('data', (data) => {
  console.log(`Trame GPS reçue : ${data}`);
  parseGPSData(data);  // Transforme les données en variables
});

// Route pour récupérer les données GPS
app.get('/gps', (req, res) => {
  if (latitude !== null && longitude !== null) {
    res.json({
      latitude,
      longitude,
      altitude,
    });  // Envoie les coordonnées GPS sous forme de JSON
  } else {
    res.status(404).send('Aucune donnée GPS disponible');
  }
});

// Démarrer un serveur web
app.get('/', (req, res) => {
  res.send('Serveur Node.js prêt à recevoir des données');
});

// Serveur HTTP sur le port 3000
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
