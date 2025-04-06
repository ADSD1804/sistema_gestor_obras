import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ArquitectoComponent } from './components/arquitecto/arquitecto.component';
import { SupervisorComponent } from './components/supervisor/supervisor.component';
import { TrabajadorComponent } from './components/trabajador/trabajador.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'arquitecto', 
    component: ArquitectoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['arquitecto'] }
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