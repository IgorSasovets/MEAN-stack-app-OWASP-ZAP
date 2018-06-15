import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { Router } from '@angular/router';

export interface UserDetails {
  _id: string;
  username: string;
  name: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  username: string;
  password: string;
  name?: string;
}

@Injectable()
export class AuthenticationService {
  private token: string;
  private payload: string;

  constructor(private http: HttpClient, private router: Router) {}

  private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  private request(method: 'post'|'get', type, user?: any): Observable<any> {
    let base;

    if (method === 'post') {
      base = this.http.post(`/api/${type}`, user, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    } else {
      base = this.http.get(`/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }

    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );

    return request;
  }

  public register(user: TokenPayload): Observable<any> {
    this.payload = `name=${user.name}&username=${user.username}&password=${user.password}`;
    return this.request('post', 'register', this.payload);
  }

  public login(user: TokenPayload): Observable<any> {
    this.payload = `username=${user.username}&password=${user.password}`;
    return this.request('post', 'login', this.payload);
  }

  public profile(): Observable<any> {
    return this.request('get', 'profile');
  }

  public logout(userName: any): Observable<any> {
    this.payload = `username=${userName}&token=${this.token}`;
    this.token = '';
    window.localStorage.removeItem('mean-token');
    return this.request('post', 'logout', this.payload);
  }
}
