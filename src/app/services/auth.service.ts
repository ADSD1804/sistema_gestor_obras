import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://rickandmortyapi.com/api/character';
  private backendUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) { }

  login(name: string): Observable<User | null> {
    const now = new Date();
    localStorage.setItem('loginTime', now.toISOString());
    return this.http.get<any>(`${this.apiUrl}?name=${name}`).pipe(
      switchMap(response => {
        if (response.results?.length > 0) {
          const character = response.results[0];

          let role: 'arquitecto' | 'supervisor' | 'trabajador';
          if (character.id % 3 === 0) role = 'arquitecto';
          else if (character.id % 3 === 1) role = 'supervisor';
          else role = 'trabajador';

          const user: User = {
            id: character.id,
            name: character.name,
            email: `${character.name.replace(/\s+/g, '').toLowerCase()}@construccion.com`,
            role,
            image: character.image,
            zone: character.origin?.name || 'Desconocida'
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          return this.registerWorker({
            name: user.name,
            role: user.role,
            zone: user.zone ?? 'Desconocida',
            email: user.email
          }).pipe(
            map(() => user)
          );
        }
        throw new Error('Personaje no encontrado');
      })
    );
  }

  updateTaskEstado(taskId: string, estado: string): Observable<any> {
    return this.http.patch(`${this.backendUrl}/gestion_obras/tareas_asignadas/${taskId}/estado`, { estado });
  }

  getWorkers(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (!response.results) return [];
        return response.results
          .map((character: any) => {
            let role: 'administrador' | 'supervisor' | 'trabajador';
            if (character.id % 3 === 0) role = 'administrador';
            else if (character.id % 3 === 1) role = 'supervisor';
            else role = 'trabajador';

            return {
              id: character.id,
              name: character.name,
              email: `${character.name.replace(/\s+/g, '').toLowerCase()}@construccion.com`,
              role,
              image: character.image,
              zone: character.origin?.name || 'Desconocida'
            } as User;
          })
          .filter((user: User) => user.role === 'trabajador');
      })
    );
  }

  assignTask(taskData: { workerName: string; email: string; task: string; assignedBy: string; nombre_supervisor?: string }): Observable<any> {
    return this.http.post(`${this.backendUrl}/gestion_obras/tareas_asignadas`, taskData);
  }

  getAssignedTasks(workerName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/gestion_obras/tareas_asignadas/${workerName}`);
  }

  registerWorker(workerData: { name: string; role: string; zone: string; email: string }): Observable<any> {
    return this.http.post(`${this.backendUrl}/gestion_obras/registro_diario`, workerData);
  }

  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentUser = this.getCurrentUser();
      const loginTime = this.getLoginTime();
      const logoutTime = new Date();
      if (currentUser && loginTime) {
        const workedTimeMs = logoutTime.getTime() - loginTime.getTime();
        const workedTimeMinutes = Math.floor(workedTimeMs / 60000);

        this.recordWorkedTime({
          userId: currentUser.id,
          loginTime: loginTime.toISOString(),
          logoutTime: logoutTime.toISOString(),
          workedMinutes: workedTimeMinutes
        }).subscribe({
          next: () => {

            localStorage.removeItem('currentUser');
            localStorage.setItem('logoutTime', logoutTime.toISOString());
          },
          error: (err) => {
            console.error('Error recording worked time:', err);

            localStorage.removeItem('currentUser');
            localStorage.setItem('logoutTime', logoutTime.toISOString());
          }
        });
      } else {

        localStorage.removeItem('currentUser');
        localStorage.setItem('logoutTime', logoutTime.toISOString());
      }
    }
  }

  recordWorkedTime(data: { userId: number; loginTime: string; logoutTime: string; workedMinutes: number }): Observable<any> {
    return this.http.post(`${this.backendUrl}/tiempo_trabajado`, data);
  }

  getCurrentUser() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getIngresoDiarioWorkers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/gestion_obras/ingreso_diario`);
  }

  getMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.backendUrl}/gestion_obras/materiales`);
  }

  addMaterial(materialData: { materialType: string; quantity: number }): Observable<any> {
    return this.http.post(`${this.backendUrl}/gestion_obras/materiales`, materialData);
  }

  deleteMaterial(materialType: string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/gestion_obras/materiales/${materialType}`);
  }
  solicitarMaterial(materialType: string, quantity: number, workerName: string, workerRole: string, email: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/gestion_obras/solicitudes_trabjadores`, { materialType, quantity, workerName, workerRole, email });
  }

  getLoginTime(): Date | null {
    const loginTime = localStorage.getItem('loginTime');
    return loginTime ? new Date(loginTime) : null;
  }

  getLogoutTime(): Date | null {
    const logoutTime = localStorage.getItem('logoutTime');
    return logoutTime ? new Date(logoutTime) : null;
  }

getSolicitudesMateriales(): Observable<any[]> {
  return this.http.get<any[]>(`${this.backendUrl}/gestion_obras/solicitudes_materiales`);
}

aprobarSolicitud(id: string): Observable<any> {
  return this.http.patch(`${this.backendUrl}/gestion_obras/solicitudes_materiales/${id}/aprobar`, {});
}

rechazarSolicitud(id: string): Observable<any> {
  return this.http.delete(`${this.backendUrl}/gestion_obras/solicitudes_materiales/${id}`);
}
}
