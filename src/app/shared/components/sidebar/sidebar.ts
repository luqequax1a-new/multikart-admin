import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { HasPermissionDirective } from '../../directive/has-permission.directive';
import { IAccountUser } from '../../interface/account.interface';
import { IPermission } from '../../interface/role.interface';
import { IValues } from '../../interface/setting.interface';
import { ISidebar, ISidebarModel } from '../../interface/sidebar.interface';
import { NavService } from '../../services/nav.service';
import { GetSidebarAction } from '../../store/action/sidebar.action';
import { AccountState } from '../../store/state/account.state';
import { SettingState } from '../../store/state/setting.state';
import { SidebarState } from '../../store/state/sidebar.state';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, TranslateModule, HasPermissionDirective],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  navServices = inject(NavService);
  private router = inject(Router);
  private store = inject(Store);
  private platformId = inject(PLATFORM_ID);

  readonly class = input<string>(undefined);

  user$: Observable<IAccountUser> = inject(Store).select(AccountState.user);
  permissions$: Observable<IPermission[]> = inject(Store).select(AccountState.permissions);
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  menu$: Observable<ISidebarModel> = inject(Store).select(SidebarState.menu);

  public item: ISidebar;
  public menuItems: ISidebar[] = [];
  public permissions: string[] = [];
  public sidebarTitleKey: string = 'sidebar';
  public role: string;

  constructor() {
    this.store.dispatch(new GetSidebarAction());
    this.menu$.subscribe(menuItems => {
      this.menuItems = menuItems?.data;
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.menuItems?.forEach((menu: ISidebar) => {
            menu.active = false;
            this.activeMenuRecursive(
              menu,
              event.url.split('?')[0].toString().split('/')[1].toString(),
            );
          });
        }
      });
    });
    this.user$.subscribe(user => (this.role = user?.role?.name));
  }

  hasMainLevelMenuPermission(acl_permission?: string[]) {
    let status = true;
    if (acl_permission?.length) {
      this.permissions$.subscribe(permission => {
        this.permissions = permission?.map((value: IPermission) => value?.name);
        if (!acl_permission?.some(action => this.permissions?.includes(<any>action))) {
          status = false;
        }
      });
    }
    return status;
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
  }

  onItemSelected(item: ISidebar, onRoute: boolean = false) {
    this.menuItems.forEach((menu: ISidebar) => {
      this.deActiveAllMenu(menu, item);
    });
    if (!onRoute) item.active = !item.active;
  }

  activeMenuRecursive(menu: ISidebar, url: string, item?: ISidebar) {
    if (menu && menu.path && menu.path == (url.charAt(0) !== '/' ? '/' + url : url)) {
      if (item) {
        item.active = true;
        this.onItemSelected(item, true);
      }
      menu.active = true;
    }
    if (menu?.children?.length) {
      menu?.children.forEach((child: ISidebar) => {
        this.activeMenuRecursive(child, url.charAt(0) !== '/' ? '/' + url : url.toString(), menu);
      });
    }
  }

  deActiveAllMenu(menu: ISidebar, item: ISidebar) {
    if (menu && menu.active && menu.id != item.id) {
      menu.active = false;
    }
    if (menu?.children?.length) {
      menu?.children.forEach((child: ISidebar) => {
        this.deActiveAllMenu(child, item);
      });
    }
  }

  closeSidebar() {
    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth < 992) {
        this.navServices.collapseSidebar = false;
      }
    }
  }
}
