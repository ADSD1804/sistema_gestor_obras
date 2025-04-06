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

  login(name:string):Observable<User | null>{
    return this.http.get<User[]>(`${this.apiUrl}?name=${name}`).pipe(
      map(response => {
        if (response.length > 0) {
          const character = response[0];

          let role: 'arquitecto' | 'supervisor' | 'trabajador';
          if (character.id % 3 === 0) role = 'arquitecto';
          else if (character.id % 3 === 1) role = 'supervisor';
          else role = 'trabajador';

          return {
            id: character.id,
            name: character.name,
            email: `${character.name.replace(/\s+/g, '').toLowerCase()}@construccion.com`,
            role,
            image: character.image
          };
        }
        return null;
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
