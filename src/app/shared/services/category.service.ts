import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { ICategoryModel } from '../interface/category.interface';
import { Params } from '../interface/core.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);

  getCategories(payload?: Params): Observable<ICategoryModel> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({ data: [] } as ICategoryModel);
    // return this.http.get<ICategoryModel>(`${environment.URL}/category.json`, { params: payload });
  }
}
