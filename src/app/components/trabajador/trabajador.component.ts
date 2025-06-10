import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Material {
  materialType: string;
  quantity: number;
}

@Component({
  selector: 'app-trabajador',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './trabajador.component.html',
  styleUrl: './trabajador.component.css'
})
export class TrabajadorComponent implements OnInit {
  currentUser: any;
  workerName = '';
  workerRole: number = 0;
  assignedTasks: any[] = [];
  email: string = '';
  workTime: string = '';
  materiales: Material[] = [];
  quantity: string = '';
  materialType: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
    this.email = this.currentUser?.email || '';
  }

  ngOnInit() {
    this.loadAssignedTasks();
    this.calculateWorkTime();
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

  solicitarMaterial() {
    if (!this.currentUser) {
      alert('No hay usuario logueado');
      return;
    }

    const quantityNumber = Number(this.quantity);
    if (isNaN(quantityNumber)) {
      alert('La cantidad debe ser un número válido');
      return;
    }

    this.authService.solicitarMaterial(
      this.materialType,
      quantityNumber,
      this.currentUser.name,
      this.currentUser.role,
      this.currentUser.email
    ).subscribe({
      next: () => {
        alert('Solicitud de material enviada correctamente');
        // Limpiar el formulario
        this.materialType = '';
        this.quantity = '';
      },
      error: (err) => {
        console.error('Error al solicitar material', err);
        alert('Error al enviar la solicitud de material');
      }
    });
  }

  loadAssignedTasks() {
    if (this.currentUser && this.currentUser.name) {
      this.authService.getAssignedTasks(this.currentUser.name).subscribe({
        next: (tasks) => {
          const filteredTasks = tasks.filter((task: any) => task.estado === 'en curso');
          this.assignedTasks = [...filteredTasks];
        },
        error: (err) => {
          console.error('Error loading assigned tasks:', err);
        }
      });
    }
  }

  finalizeTask(task: any) {
    this.authService.updateTaskEstado(task._id, 'finalizada').subscribe({
      next: () => {
        this.assignedTasks = this.assignedTasks.filter(t => t._id !== task._id);
      },
      error: (err) => {
        console.error('Error finalizing task:', err);
      }
    });
  }

  onEstadoChange(task: any, newEstado: string) {
    this.authService.updateTaskEstado(task._id, newEstado).subscribe({
      next: (updatedTask) => {
        task.estado = updatedTask.estado;
      },
      error: (err) => {
        console.error('Error updating task estado:', err);
      }
    });
  }

  onNameChange() {
    if (this.workerName.trim()) {
      this.authService.login(this.workerName.trim()).subscribe({
        next: (user) => {
          if (user) {
            const workerData = {
              name: user.name,
              role: user.role,
              zone: user.zone ?? 'Desconocida',
              email: user.email
            };
            this.authService.registerWorker(workerData).subscribe({
              next: () => alert('Registro exitoso con zona automática: ' + workerData.zone),
              error: (error) => alert('Error en el registro: ' + error.message)
            });
          }
        },
        error: (err) => alert('Error al obtener usuario: ' + err.message)
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  calculateWorkTime() {
    const loginTime = this.authService.getLoginTime();
    const logoutTime = this.authService.getLogoutTime();
    if (loginTime && logoutTime) {
      const diffMs = logoutTime.getTime() - loginTime.getTime();
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      this.workTime = `${diffHrs}h ${diffMins}m`;
    } else {
      this.workTime = 'No disponible';
    }
  }
}
