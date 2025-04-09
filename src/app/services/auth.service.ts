import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://rickandmortyapi.com/api/character';

  constructor(private http: HttpClient) {}

  login(name: string): Observable<User | null> {
    return this.http.get<any>(`${this.apiUrl}?name=${name}`).pipe(
      map(response => {
        if (response.results?.length > 0) {
          const character = response.results[0];
          
          let role: 'arquitecto' | 'supervisor' | 'trabajador';
          if (character.id % 3 === 0) role = 'arquitecto';
          else if (character.id % 3 === 1) role = 'supervisor';
          else role = 'trabajador';

          const user = {
            id: character.id,
            name: character.name,
            email: `${character.name.replace(/\s+/g, '').toLowerCase()}@construccion.com`,
            role,
            image: character.image
          };
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          return user;
        }
        throw new Error('Personaje no encontrado');
      })
    );
  }

  logout(){
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(){
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}
