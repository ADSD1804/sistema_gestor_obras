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

app.post('/gestion_obras/registro_diario', async (req, res) => {
  try {
    const ingreso = new IngresoDiario(req.body);
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

const TareaAsignada = mongoose.model('TareaAsignada', tareasAsignadasSchema);

const materialSchema = new mongoose.Schema({
  materialType: { type: String, required: true },
  quantity: { type: Number, required: true }
}, { collection: 'materiales' });

const Material = mongoose.model('Material', materialSchema);

app.get('/gestion_obras/materiales', async (req, res) => {
  console.log('Accediendo a GET /gestion_obras/materiales');
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    console.log(`Encontrados ${materials.length} materiales`);
    res.json(materials);
  } catch (error) {
    console.error('Error en GET materiales:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/gestion_obras/materiales', async (req, res) => {
  try {
    const { materialType, quantity } = req.body;
    if (!materialType || !quantity) {
      return res.status(400).json({ error: 'materialType and quantity are required' });
    }
    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be a number greater than 0' });
    }
    const material = new Material({ materialType, quantity });
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/gestion_obras/materiales/:materialType', async (req, res) => {
  try {
    const deletedMaterial = await Material.findByIdAndDelete(req.params.materialType);

    if (!deletedMaterial) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get('/gestion_obras/tareas_asignadas/:workerName', async (req, res) => {
  try {
    const workerName = req.params.workerName;
    const tareas = await TareaAsignada.find({ workerName });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/gestion_obras/ingreso_diario', async (req, res) => {
  try {
    const ingresoDiarioData = await IngresoDiario.find({}, { counters: 0 }).lean();
    res.json(ingresoDiarioData);
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


const solicitudMaterialSchema = new mongoose.Schema({
  materialType: String,
  quantity: Number,
  workerName: String,
  workerRole: String,
  email: String,
  fechaSolicitud: { type: Date, default: Date.now },
  estado: { type: String, default: 'pendiente' }
}, { collection: 'solicitudes_materiales' });

const SolicitudMaterial = mongoose.model('SolicitudMaterial', solicitudMaterialSchema);

app.post('/gestion_obras/solicitudes_trabjadores', async (req, res) => {
  try {
    const { materialType, quantity, workerName, workerRole, email } = req.body;

    if (!materialType || !quantity || !workerName || !workerRole || !email) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const solicitud = new SolicitudMaterial({
      materialType,
      quantity,
      workerName,
      workerRole,
      email,
      estado: 'pendiente'
    });

    await solicitud.save();
    res.status(201).json(solicitud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/gestion_obras/solicitudes_materiales', async (req, res) => {
  try {
    const solicitudes = await SolicitudMaterial.find().sort({ fechaSolicitud: -1 });
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aprobar solicitud
app.patch('/gestion_obras/solicitudes_materiales/:id/aprobar', async (req, res) => {
  try {
    const updatedSolicitud = await SolicitudMaterial.findByIdAndUpdate(
      req.params.id,
      { estado: 'aprobado' },
      { new: true }
    );

    if (!updatedSolicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json(updatedSolicitud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rechazar solicitud (eliminar)
app.delete('/gestion_obras/solicitudes_materiales/:id', async (req, res) => {
  try {
    const deletedSolicitud = await SolicitudMaterial.findByIdAndDelete(req.params.id);

    if (!deletedSolicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json({ message: 'Solicitud rechazada y eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const zonaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'zonas' });

const Zona = mongoose.model('Zona', zonaSchema);

const tareasAsignadasSchema = new mongoose.Schema({
  workerName: String,
  email: String,
  task: String,
  assignedBy: String,
  assignedAt: { type: Date, default: Date.now },
  estado: { type: String, default: 'en curso' },
  zone: String 
}, { collection: 'tareas_asignadas' });

app.get('/gestion_obras/zonas', async (req, res) => {
  try {
    const zonas = await Zona.find().sort({ nombre: 1 });
    res.json(zonas.map(z => z.nombre));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/gestion_obras/zonas', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la zona es requerido' });
    }

    const zonaExistente = await Zona.findOne({ nombre });
    if (zonaExistente) {
      return res.status(400).json({ error: 'La zona ya existe' });
    }

    const zona = new Zona({ nombre });
    await zona.save();
    res.status(201).json(zona);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
