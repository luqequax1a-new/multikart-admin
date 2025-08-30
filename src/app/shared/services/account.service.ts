import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { IAccountUser } from '../interface/account.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);

  getUserDetails(): Observable<IAccountUser> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({} as IAccountUser);
    // return this.http.get<IAccountUser>(`${environment.URL}/self.json`);
  }
}
