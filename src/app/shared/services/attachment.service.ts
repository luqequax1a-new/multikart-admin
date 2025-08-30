import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { IAttachmentModel } from '../interface/attachment.interface';
import { Params } from '../interface/core.interface';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private http = inject(HttpClient);

  getAttachments(payload?: Params): Observable<IAttachmentModel> {
    return this.http.get<IAttachmentModel>(`${environment.URL}/attachment.json`, {
      params: payload,
    });
  }
}
