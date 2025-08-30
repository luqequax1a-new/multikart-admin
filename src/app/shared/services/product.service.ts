import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { IProductModel } from '../interface/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.URL}/products`;

  list(params: any = {}): Observable<any> {
    const httpParams = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .reduce((acc, [k, v]) => acc.set(k, String(v)), new HttpParams());
    
    return this.http.get(`${this.baseUrl}`, { params: httpParams });
  }

  getProducts(payload?: Params): Observable<IProductModel> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({ data: [] } as IProductModel);
    // return this.http.get<IProductModel>(`${environment.URL}/product.json`, { params: payload });
  }

  updateStatus(id: number, status: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { is_active: status });
  }

  create(product: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, product);
  }

  update(id: number, product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, product);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  duplicate(id: number): Observable<{data: any}> {
    return this.http.post<{data: any}>(`${this.baseUrl}/${id}/duplicate`, {});
  }
}
