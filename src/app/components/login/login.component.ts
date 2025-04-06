import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';

  constructor(private authService: AuthService, private router: Router) {}

  login (){
    this.authService.login(this.username).subscribe(user => {
      if (user){
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate([`/${user.role}`]);
      } else {
        alert('Usuario no encontrado!!');
      }
    })
  }
}
