import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { IBlogModel } from '../interface/blog.interface';
import { Params } from '../interface/core.interface';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private http = inject(HttpClient);

  getBlogs(payload?: Params): Observable<IBlogModel> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({ data: [] } as IBlogModel);
    // return this.http.get<IBlogModel>(`${environment.URL}/blog.json`, { params: payload });
  }
}
