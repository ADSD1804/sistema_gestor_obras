import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-arquitecto',
  imports: [RouterLink],
  templateUrl: './arquitecto.component.html',
  styleUrl: './arquitecto.component.css'
})
export class ArquitectoComponent {
logout() {
throw new Error('Method not implemented.');
}
currentUser: any;

}
