import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  currentUser: any;
  email: string = '';
  workTime: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.supervisors = [
      { id: 1, name: 'Supervisor 1', role: 'supervisor', permissions: ['read'] },
      { id: 2, name: 'Supervisor 2', role: 'supervisor', permissions: ['read'] }
    ];
    this.workers = [
      { id: 1, name: 'Worker 1', role: 'trabajador', permissions: ['read'] },
      { id: 2, name: 'Worker 2', role: 'trabajador', permissions: ['read'] }
    ];
    this.currentUser = this.authService.getCurrentUser();
    this.email = this.currentUser?.email || '';
    this.calculateWorkTime();
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  calculateWorkTime() {
    const loginTime = this.authService.getLoginTime();
    const logoutTime = this.authService.getLogoutTime();
    if (loginTime && logoutTime) {
      const diffMs = logoutTime.getTime() - loginTime.getTime();
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      this.workTime = `${diffHrs}h ${diffMins}m`;
    } else {
      this.workTime = 'No disponible';
    }
  }
}
