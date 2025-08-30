import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable, catchError, throwError } from 'rxjs';

import { NotificationService } from '../../shared/services/notification.service';
import { AuthClearAction } from '../../shared/store/action/auth.action';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private store = inject(Store);
  private notificationService = inject(NotificationService);

  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    const token = this.store.selectSnapshot(state => state.auth.access_token);

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Prevent infinite redirect loop - don't redirect if already on auth pages
          const currentUrl = this.router.url;
          if (!currentUrl.startsWith('/auth')) {
            this.notificationService.notification = false;
            this.store.dispatch(new AuthClearAction());
            void this.router.navigate(['/auth/login']);
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
