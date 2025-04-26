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
      this.authService.getAssignedTasks(this.currentUser.name).subscribe({
        next: (tasks) => {
          this.assignedTasks = tasks;
        },
        error: (err) => {
          console.error('Error loading assigned tasks:', err);
        }
      });
    }
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
