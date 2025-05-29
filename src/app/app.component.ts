import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HomeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sistema_gestor_obras';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {
    this.isLoggedIn = !!this.authService.getCurrentUser();
  }
}
