import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IPermission } from '../../shared/interface/role.interface';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard {
  private store = inject(Store);
  router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const permissions = this.store
      .selectSnapshot(state => state.account)
      .permissions?.map((value: IPermission) => value?.name);
    const requiredPermission = route.data?.['permission'];

    if (!requiredPermission) {
      return true; // no permission required, allow access
    }

    if (!Array.isArray(requiredPermission) && permissions?.includes(requiredPermission)) {
      return true;
    } else if (
      Array.isArray(requiredPermission) &&
      requiredPermission?.length &&
      requiredPermission.every(action => permissions?.includes(action))
    ) {
      return true;
    } else {
      void this.router.navigate(['/error/403']);
      return false;
    }
  }
}
