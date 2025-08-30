import {
  Directive,
  inject,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  input,
} from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IPermission } from '../interface/role.interface';
import { AccountState } from '../store/state/account.state';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef = inject<TemplateRef<string>>(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);

  readonly permission = input<string | string[]>(undefined, { alias: 'hasPermission' });

  permissions$: Observable<IPermission[]> = inject(Store).select(AccountState.permissions);

  public permissions: string[] = [];

  private isViewCreated = false;

  ngOnInit() {
    this.permissions$.subscribe(permission => {
      this.permissions = permission?.map((value: IPermission) => value?.name);
      this.checkPermissions();
    });
  }

  private checkPermissions() {
    const permission = this.permission();
    if ((!Array.isArray(permission) && this.permissions?.includes(permission)) || !permission) {
      if (!this.isViewCreated) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.isViewCreated = true;
      }
    } else if (
      Array.isArray(permission) &&
      permission?.length &&
      permission.every(action => this.permissions?.includes(action))
    ) {
      if (!this.isViewCreated) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.isViewCreated = true;
      }
    } else {
      if (this.isViewCreated) {
        this.viewContainerRef.clear();
        this.isViewCreated = false;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['permission'] && !changes['permission'].firstChange) {
      this.checkPermissions();
    }
  }
}
