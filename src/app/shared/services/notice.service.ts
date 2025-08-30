import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { INoticeModel } from '../interface/notice.interface';

@Injectable({
  providedIn: 'root',
})
export class NoticeService {
  private http = inject(HttpClient);

  getNotice(payload?: Params): Observable<INoticeModel> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({ data: [] } as INoticeModel);
    // return this.http.get<INoticeModel>(`${environment.URL}/notice.json`, { params: payload });
  }
}
