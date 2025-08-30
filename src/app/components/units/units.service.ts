import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { environment } from '../../../environments/environment';
import { IUnit, IUnitsResponse, ICreateUnit, IUpdateUnit } from './units.interface';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private apiUrl = `http://localhost:8000/api/admin/v1/units`;

  list(params?: any): Observable<IUnit[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<IUnit[]>(this.apiUrl, { params: httpParams })
      .pipe(
        map(response => {
          // API düz array döndürüyor, eğer gelmezse boş array döndür
          return Array.isArray(response) ? response : [];
        }),
        catchError(error => {
          this.notificationService.showError('Birimler listesi alınırken hata oluştu.');
          return throwError(() => error);
        })
      );
  }

  create(payload: ICreateUnit): Observable<IUnit> {
    return this.http.post<IUnit>(this.apiUrl, payload)
      .pipe(
        catchError(error => {
          this.notificationService.showError('Birim kaydı oluşturulamadı.');
          return throwError(() => error);
        })
      );
  }

  update(id: number, payload: ICreateUnit): Observable<IUnit> {
    return this.http.put<IUnit>(`${this.apiUrl}/${id}`, payload)
      .pipe(
        catchError(error => {
          this.notificationService.showError('Birim güncellenirken hata oluştu.');
          return throwError(() => error);
        })
      );
  }

  updateStatus(id: number, is_active: boolean): Observable<IUnit> {
    return this.http.patch<IUnit>(`${this.apiUrl}/${id}`, { is_active })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  remove(id: number): Observable<any> {
    console.log('UnitsService.remove çağrıldı, ID:', id);
    console.log('API URL:', `${this.apiUrl}/${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          this.notificationService.showError('Birim silinirken hata oluştu.');
          return throwError(() => error);
        })
      );
  }

  getById(id: number): Observable<IUnit> {
    // Backend'de tek birim getirme endpoint'i yok, liste üzerinden filtreleme yapıyoruz
    return this.list().pipe(
      map(units => {
        const unit = units.find(u => u.id === id);
        if (!unit) {
          throw new Error(`ID ${id} ile birim bulunamadı`);
        }
        return unit;
      }),
      catchError(error => {
        this.notificationService.showError('Birim bilgileri alınırken hata oluştu.');
        return throwError(() => error);
      })
    );
  }

  replace(unitId: number, newUnitId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${unitId}/replace`, { new_unit_id: newUnitId })
      .pipe(
        catchError(error => {
          this.notificationService.showError('Birim değiştirme işlemi sırasında hata oluştu.');
          return throwError(() => error);
        })
      );
  }
}