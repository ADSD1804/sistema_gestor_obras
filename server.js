const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');


const mongoUri = "mongodb+srv://andresdavidsoto:adsd1804@sistema-gestor-obras.ve3hami.mongodb.net/sistema_gestor_obras?retryWrites=true&w=majority";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

const app = express();
const PORT = 3001;
const LOGS_FILE = path.join(__dirname, 'logs.json');

app.use(cors({
  origin: 'http://localhost:4200', 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());


const ingresoDiarioSchema = new mongoose.Schema({
  name: String,
  role: String,
  zone: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'ingreso_diario' });
const IngresoDiario = mongoose.model('IngresoDiario', ingresoDiarioSchema);

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
}, { collection: 'counters' });
const Counter = mongoose.model('Counter', counterSchema);

async function getNextSequence(name) {
  const ret = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return ret.seq;
}

app.post('/gestion_obras/registro_diario', async (req, res) => {
  try {
    const nextId = await getNextSequence('ingreso_diario_id');
    const ingresoData = { ...req.body, id: nextId };
    const ingreso = new IngresoDiario(ingresoData);
    await ingreso.save();
    res.status(201).json(ingreso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente');
});


async function initializeLogsFile() {
  try {
    await fs.access(LOGS_FILE);
  } catch {
    await fs.writeFile(LOGS_FILE, JSON.stringify([]));
  }
}


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


app.get('/api/logs', async (req, res) => {
  try {
    const logsData = await fs.readFile(LOGS_FILE, 'utf8');
    const logs = JSON.parse(logsData);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const tareasAsignadasSchema = new mongoose.Schema({
  workerName: String,
  email: String,
  task: String,
  assignedBy: String,
  assignedAt: { type: Date, default: Date.now },
  estado: { type: String, default: 'en curso' }
}, { collection: 'tareas_asignadas' });

const TareaAsignada = mongoose.model('TareaAsignada', tareasAsignadasSchema);

// Update POST endpoint to save nombre_supervisor and estado
app.post('/gestion_obras/tareas_asignadas', async (req, res) => {
  try {
    const { workerName, email, task, assignedBy, nombre_supervisor } = req.body;
    const tareaData = {
      workerName,
      email,
      task,
      assignedBy,
      nombre_supervisor: nombre_supervisor || assignedBy,
      assignedAt: new Date(),
      estado: 'en curso'
    };
    const tarea = new TareaAsignada(tareaData);
    await tarea.save();
    res.status(201).json(tarea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH endpoint to update estado of a task
app.patch('/gestion_obras/tareas_asignadas/:id/estado', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { estado } = req.body;
    if (!estado) {
      return res.status(400).json({ error: 'Estado is required' });
    }
    const updatedTask = await TareaAsignada.findByIdAndUpdate(
      taskId,
      { estado },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint to fetch tasks assigned to a worker
app.get('/gestion_obras/tareas_asignadas/:workerName', async (req, res) => {
  try {
    const workerName = req.params.workerName;
    const tareas = await TareaAsignada.find({ workerName });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


initializeLogsFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`Registros guardados en: ${LOGS_FILE}`);
  });
});
