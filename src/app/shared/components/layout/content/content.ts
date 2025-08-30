import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';

import { GetUserDetailsAction } from 'src/app/shared/store/action/account.action';
import { GetNotificationAction } from 'src/app/shared/store/action/notification.action';
import { GetBadgesAction } from 'src/app/shared/store/action/sidebar.action';

import { NavService } from '../../../services/nav.service';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { Sidebar } from '../../sidebar/sidebar';
import { SidebarMenuSkeleton } from '../../ui/skeleton/sidebar-menu-skeleton/sidebar-menu-skeleton';

@Component({
  selector: 'app-content',
  imports: [RouterModule, Header, Footer, SidebarMenuSkeleton, Sidebar, RouterModule],
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {
  navServices = inject(NavService);
  private router = inject(Router);
  private store = inject(Store);
  private platformId = inject<Object>(PLATFORM_ID);

  public isBrowser: boolean;

  constructor() {
    this.navServices.sidebarLoading = true;
    this.store.dispatch(new GetBadgesAction());
    this.store.dispatch(new GetNotificationAction());
    this.store.dispatch(new GetUserDetailsAction()).subscribe({
      complete: () => {
        this.navServices.sidebarLoading = false;
      },
    });
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/order/create') {
          this.navServices.collapseSidebar = true;
        }
      }
    });
  }
}
