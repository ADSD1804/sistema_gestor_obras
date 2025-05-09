import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-arquitecto',
  imports: [RouterLink],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css'
})
export class ArquitectoComponent {
logout() {
throw new Error('Method not implemented.');
}
currentUser: any;

}
