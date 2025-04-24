import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trabajador',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './trabajador.component.html',
  styleUrl: './trabajador.component.css'
})
export class TrabajadorComponent {
  currentUser: any;
  workerName = '';
  workerRole = 'trabajador';

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
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
