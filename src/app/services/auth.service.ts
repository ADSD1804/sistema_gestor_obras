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

  constructor(private http: HttpClient) {}

  login(name: string): Observable<User | null> {
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

  registerWorker(workerData: { name: string; role: string; zone: string; email: string }): Observable<any> {
    return this.http.post(`${this.backendUrl}/gestion_obras/registro_diario`, workerData);
  }

  logout(){
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(){
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}
