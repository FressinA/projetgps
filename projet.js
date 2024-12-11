const express = require('express'); // Pour créer l'API REST
const { ReadlineParser } = require('@serialport/parser-readline');
const { SerialPort } = require('serialport');

const app = express();
const PORT = 3000;

// Configuration du port série
const port = new SerialPort({
  path: 'COM3', // Remplacez par votre port série réel
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
});

// Parseur pour lire les trames ligne par ligne
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Variables pour stocker la latitude et la longitude
let latitude = null;
let longitude = null;

// Fonction pour extraire la latitude et la longitude depuis une trame GPGGA
function parseGPSData(data) {
  const parts = data.split(',');

  if (parts[0] === '$GPGGA') { // Vérifie que la trame est bien de type GPGGA
    latitude = parseCoordinate(parts[2], parts[3]); // Extraction de la latitude
    longitude = parseCoordinate(parts[4], parts[5]); // Extraction de la longitude
    console.log(`Latitude : ${latitude}, Longitude : ${longitude}`); // Affiche les données dans la console
  }
}

// Fonction pour convertir une coordonnée en degrés décimaux
function parseCoordinate(coordinate, direction) {
  if (!coordinate || !direction) return null;

  const degrees = parseFloat(coordinate.slice(0, 2));
  const minutes = parseFloat(coordinate.slice(2));

  let decimalCoord = degrees + minutes / 60;
  if (direction === 'S' || direction === 'W') {
    decimalCoord *= -1; // Sud et Ouest sont négatifs
  }

  return decimalCoord;
}

// Écoute des trames GPS sur le port série
parser.on('data', (data) => {
  console.log(`Trame reçue : ${data}`);
  parseGPSData(data); // Analyse la trame pour extraire les données
});

// Route API pour récupérer les coordonnées GPS
app.get('/gps', (req, res) => {
  if (latitude !== null && longitude !== null) {
    res.json({ latitude, longitude }); // Envoie uniquement latitude et longitude
  } else {
    res.status(404).send('Aucune donnée GPS disponible');
  }
});

// Démarre le serveur web
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
