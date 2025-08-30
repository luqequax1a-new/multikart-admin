import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { IStates } from '../interface/state.interface';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private http = inject(HttpClient);

  getStates(): Observable<IStates[]> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of([]);
    // return this.http.get<IStates[]>(`${environment.URL}/state.json`);
  }
}
