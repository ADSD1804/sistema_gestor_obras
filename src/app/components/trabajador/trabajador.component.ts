import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';

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
  workerRole = 'trabajador';
  assignedTasks: any[] = [];

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadAssignedTasks();
  }

  loadAssignedTasks() {
    if (this.currentUser && this.currentUser.name) {
      console.log('Loading tasks for worker:', this.currentUser.name);
      this.authService.getAssignedTasks(this.currentUser.name).subscribe({
        next: (tasks) => {
          console.log('Tasks received:', tasks);
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
      next: (updatedTask) => {
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
}
