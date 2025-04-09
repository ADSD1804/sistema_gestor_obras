const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;
const LOGS_FILE = path.join(__dirname, 'logs.json');

// Configuración CORS más estricta
app.use(cors({
  origin: 'http://localhost:4200', // Reemplaza con tu puerto de Angular
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente');
});

// Inicializar archivo JSON si no existe
async function initializeLogsFile() {
  try {
    await fs.access(LOGS_FILE);
  } catch {
    await fs.writeFile(LOGS_FILE, JSON.stringify([]));
  }
}

// Endpoint para guardar logs
app.post('/api/logs', async (req, res) => {
  try {
    const { usuario, rol } = req.body;
    const newLog = {
      usuario,
      rol,
      fecha: new Date().toISOString()
    };

    const logsData = await fs.readFile(LOGS_FILE, 'utf8');
    const logs = JSON.parse(logsData);
    logs.push(newLog);
    
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener logs
app.get('/api/logs', async (req, res) => {
  try {
    const logsData = await fs.readFile(LOGS_FILE, 'utf8');
    const logs = JSON.parse(logsData);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
initializeLogsFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`Registros guardados en: ${LOGS_FILE}`);
  });
});
