import { Component, OnInit } from '@angular/core';

interface UserPermission {
  id: number;
  name: string;
  role: 'supervisor' | 'trabajador';
  permissions: string[];
}

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})
export class AdministradorComponent implements OnInit {

  supervisors: UserPermission[] = [];
  workers: UserPermission[] = [];

  constructor() { }

  ngOnInit(): void {
    // Sample data initialization
    this.supervisors = [
      { id: 1, name: 'Supervisor 1', role: 'supervisor', permissions: ['read'] },
      { id: 2, name: 'Supervisor 2', role: 'supervisor', permissions: ['read'] }
    ];
    this.workers = [
      { id: 1, name: 'Worker 1', role: 'trabajador', permissions: ['read'] },
      { id: 2, name: 'Worker 2', role: 'trabajador', permissions: ['read'] }
    ];
  }

  togglePermission(user: UserPermission, permission: string) {
    const index = user.permissions.indexOf(permission);
    if (index > -1) {
      user.permissions.splice(index, 1);
    } else {
      user.permissions.push(permission);
    }
  }

  hasPermission(user: UserPermission, permission: string): boolean {
    return user.permissions.includes(permission);
  }

}
