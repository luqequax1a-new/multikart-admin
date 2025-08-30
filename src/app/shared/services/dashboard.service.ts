import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { IRevenueChart, IStatisticsCount } from '../interface/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  getStatisticsCount(payload?: Params): Observable<IStatisticsCount> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({} as IStatisticsCount);
    // return this.http.get<IStatisticsCount>(`${environment.URL}/dashboard/statistics`, { params: payload });
  }

  getRevenueChart(): Observable<IRevenueChart> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({} as IRevenueChart);
    // return this.http.get<IRevenueChart>(`${environment.URL}/dashboard/revenue-chart`);
  }
}
