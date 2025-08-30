import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { ICountry } from '../interface/country.interface';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private http = inject(HttpClient);
  private platformId = inject<Object>(PLATFORM_ID);

  getCountries(): Observable<ICountry[]> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of([]);
    // return this.http.get<ICountry[]>(`${environment.URL}/country.json`);
  }
}
