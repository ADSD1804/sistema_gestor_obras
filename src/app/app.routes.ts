import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdministradorComponent } from './components/administrador/administrador.component';
import { SupervisorComponent } from './components/supervisor/supervisor.component';
import { TrabajadorComponent } from './components/trabajador/trabajador.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'administrador', 
    component: AdministradorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['administrador'] }
  },
  { 
    path: 'supervisor', 
    component: SupervisorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['supervisor'] }
  },
  { 
    path: 'trabajador', 
    component: TrabajadorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['trabajador'] }
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }