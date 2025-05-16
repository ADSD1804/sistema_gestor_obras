import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogService } from '../../services/log.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var google: any;

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
    this.loadGoogleMapsScript();
  }

  loadGoogleMapsScript() {
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=';
      script.async = true;
      script.defer = true;
      script.onload = () => this.initMap();
      document.head.appendChild(script);
    } else {
      this.initMap();
    }
  }

  initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
            center: userLocation,
            zoom: 12
          });
          new google.maps.Marker({
            position: userLocation,
            map: map,
            title: 'Tu ubicación'
          });
        },
        () => {
          console.error('Error al obtener la ubicación');
        }
      );
    } else {
      console.error('Geolocalización no soportada por el navegador');
    }
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
          // Map arquitecto role to administrador for redirection
          const redirectRole = user.role === 'arquitecto' ? 'administrador' : user.role;
          this.router.navigate([`/${redirectRole}`]);
        }
      },
      error: (err) => {
        alert(err.message || 'Error al buscar el personaje');
      }
    });
  }
}
