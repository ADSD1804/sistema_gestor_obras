import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginLog {
  usuario: string;
  rol: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly API_URL = 'http://localhost:3001/api/logs';

  constructor(private http: HttpClient) {}

  addLoginEntry(user: string, role: string): Observable<LoginLog> {
    return this.http.post<LoginLog>(this.API_URL, { 
      usuario: user, 
      rol: role 
    });
  }

  getLogEntries(): Observable<LoginLog[]> {
    return this.http.get<LoginLog[]>(this.API_URL);
  }
}
