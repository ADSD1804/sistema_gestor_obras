import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterOutlet, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  username = '';
  currentDate: string = '';
  currentTime: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private logService: LogService
  ) {}

  ngOnInit() {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  updateDateTime() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.currentTime = now.toLocaleTimeString('es-ES');
  }

  login() {
    if (!this.username.trim()) {
      alert('Por favor ingrese un nombre de personaje');
      return;
    }

    this.authService.login(this.username).subscribe({
      next: (user) => {
        if (user) {
          this.logService.addLoginEntry(this.username, user.role);
          this.router.navigate([`/${user.role}`]);
        }
      },
      error: (err) => {
        alert(err.message || 'Error al buscar el personaje');
      }
    });
  }
}
