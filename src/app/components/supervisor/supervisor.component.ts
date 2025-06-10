import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';

interface Material {
  materialType: string;
  quantity: number;
}

interface SolicitudMaterial {
  _id: string;
  materialType: string;
  quantity: number;
  workerName: string;
  workerRole: string;
  email: string;
  fechaSolicitud: Date;
  estado: string;
}

@Component({
  selector: 'app-supervisor',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './supervisor.component.html',
  styleUrl: './supervisor.component.css'
})
export class SupervisorComponent implements OnInit {
  currentUser: any;
  workers: User[] = [];
  selectedWorker: User | null = null;
  task: string = '';
  email: string = '';
  allTasks: any[] = [];
  workTime: any;
  materiales: Material[] = [];
  displayedColumns: string[] = ['materialType', 'quantity', 'actions'];
  materialType: string = '';
  quantity: number | null = null;
  solicitudes: SolicitudMaterial[] = [];
  filteredSolicitudes: SolicitudMaterial[] = [];
  filtroEstado: string = 'pendiente';
  zones: string[] = [];
  zone: string = '';
  selectedZone: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadIngresoDiarioWorkers();
    this.cargarMateriales();
    this.loadZones();
  }

  loadZones() {
    this.authService.getZonas().subscribe({
      next: (zonas) => {
        this.zones = zonas;
      },
      error: (err) => {
        console.error('Error cargando zonas:', err);
        alert('Error al cargar las zonas de trabajo');
      }
    });
  }

  createZone() {
    if (!this.zone.trim()) {
      alert('Por favor ingrese un nombre para la zona');
      return;
    }

    this.authService.createZona(this.zone.trim()).subscribe({
      next: () => {
        alert('Zona creada correctamente');
        this.zone = '';
        this.loadZones(); // Recargar la lista de zonas
      },
      error: (err) => {
        console.error('Error creando zona:', err);
        alert('Error al crear la zona');
      }
    });
  }

  assignTask() {
    if (!this.selectedWorker || !this.task.trim() || !this.selectedZone) {
      alert('Por favor, complete todos los campos: trabajador, tarea y zona.');
      return;
    }

    const taskData = {
      workerName: this.selectedWorker.name,
      email: this.email,
      task: this.task.trim(),
      assignedBy: this.currentUser?.name || 'Desconocido',
      zone: this.selectedZone 
    };

    this.authService.assignTask(taskData).subscribe({
      next: () => {
        alert('Tarea asignada correctamente.');
        this.task = '';
        this.selectedWorker = null;
        this.selectedZone = null;
        this.email = '';
        this.loadTasks();
      },
      error: (err) => {
        alert('Error al asignar la tarea: ' + err.message);
      }
    });
  }

  loadIngresoDiarioWorkers() {
    this.authService.getIngresoDiarioWorkers().subscribe({
      next: (workers) => {
        this.workers = workers;
      },
      error: (err) => {
        console.error('Error loading ingreso diario workers:', err);
      }
    });
  }

  loadWorkers() {
    this.authService.getWorkers().subscribe({
      next: (workers) => {
        this.workers = workers;
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error loading workers:', err);
      }
    });
  }

  loadTasks() {
    this.allTasks = [];
    const tasksObservables = this.workers.map(worker =>
      this.authService.getAssignedTasks(worker.name)
    );

    Promise.all(tasksObservables.map(obs => obs.toPromise()))
      .then(results => {
        results.forEach(tasks => {
          if (tasks) {
            const filtered = tasks.filter((task: any) => task.estado === 'en curso' || task.estado === 'finalizada');
            this.allTasks.push(...filtered);
          }
        });
      })
      .catch(err => {
        console.error('Error loading tasks:', err);
      });
  }

  onWorkerChange() {
    if (this.selectedWorker) {
      this.email = this.selectedWorker.email;
    } else {
      this.email = '';
    }
  }

  submitMaterial() {
    if (!this.materialType || !this.quantity || this.quantity < 1) {
      console.error('Datos del formulario inválidos');
      return;
    }

    const quantityNumber = Number(this.quantity);

    const materialData = {
      materialType: this.materialType,
      quantity: quantityNumber
    };

    this.authService.addMaterial(materialData).subscribe({
      next: (response) => {
        console.log('Material guardado exitosamente', response);
        this.materialType = '';
        this.quantity = 1;
        alert('Material registrado correctamente');
      },
      error: (err) => {
        console.error('Error al guardar el material', err);
        alert('Ocurrió un error al registrar el material');
      }
    });
  }
  cargarMateriales() {
    this.authService.getMateriales().subscribe({
      next: (data: Material[]) => {
        this.materiales = data;
      },
      error: (err) => {
        console.error('Error al cargar materiales', err);
        alert('Error al cargar la lista de materiales');
      }
    });
  }
  eliminarMaterial(materialType: string) {
    if (confirm('¿Está seguro de eliminar este material?')) {
      this.authService.deleteMaterial(materialType).subscribe({
        next: () => {
          this.cargarMateriales();
          alert('Material eliminado correctamente');
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert('Error al eliminar el material');
        }
      });
    }
  }

  cargarSolicitudes() {
    this.authService.getSolicitudesMateriales().subscribe({
      next: (data: SolicitudMaterial[]) => {
        this.solicitudes = data;
        this.filtrarSolicitudes();
      },
      error: (err) => {
        console.error('Error al cargar solicitudes', err);
        alert('Error al cargar las solicitudes de materiales');
      }
    });
  }

  filtrarSolicitudes() {
    if (this.filtroEstado === 'todas') {
      this.filteredSolicitudes = [...this.solicitudes];
    } else {
      this.filteredSolicitudes = this.solicitudes.filter(
        s => s.estado === this.filtroEstado
      );
    }
  }

  aprobarSolicitud(id: string) {
    this.authService.aprobarSolicitud(id).subscribe({
      next: () => {
        alert('Solicitud aprobada correctamente');
        this.cargarSolicitudes();
      },
      error: (err) => {
        console.error('Error al aprobar solicitud', err);
        alert('Error al aprobar la solicitud');
      }
    });
  }

  rechazarSolicitud(id: string) {
    if (confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
      this.authService.rechazarSolicitud(id).subscribe({
        next: () => {
          alert('Solicitud rechazada correctamente');
          this.cargarSolicitudes();
        },
        error: (err) => {
          console.error('Error al rechazar solicitud', err);
          alert('Error al rechazar la solicitud');
        }
      });
    }
  }

  onEstadoFilterChange() {
    this.filtrarSolicitudes();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
