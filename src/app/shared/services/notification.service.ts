import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { INotificationModel } from '../interface/notification.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private zone = inject(NgZone);
  private http = inject(HttpClient);
  private modalService = inject(NgbModal);
  private toastr = inject(ToastrService);

  public alertSubject = new Subject();

  public notification: boolean = true;

  showSuccess(message: string): void {
    this.alertSubject.next({ type: 'success', message: message });
    this.zone.run(() => {
      this.modalService.dismissAll();
      if (this.notification) {
        this.toastr.success(message);
      }
    });
  }

  showError(message: string): void {
    this.alertSubject.next({ type: 'error', message: message });
    this.zone.run(() => {
      if (this.notification) {
        this.toastr.error(message);
      }
    });
  }

  getNotifications(payload?: Params): Observable<INotificationModel> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({ data: [] } as INotificationModel);
    // return this.http.get<INotificationModel>(`${environment.URL}/notifications.json`, {
    //   params: payload,
    // });
  }
}
