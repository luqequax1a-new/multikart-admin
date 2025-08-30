import { CommonModule } from '@angular/common';
import { Component, inject, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IAccountUser } from '../../../../interface/account.interface';
import { LogoutAction } from '../../../../store/action/auth.action';
import { AccountState } from '../../../../store/state/account.state';
import { ConfirmationModal } from '../../../ui/modal/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, TranslateModule, ConfirmationModal],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private store = inject(Store);

  user$: Observable<IAccountUser> = inject(Store).select(AccountState.user);

  readonly ConfirmationModal = viewChild<ConfirmationModal>('confirmationModal');

  public active: boolean = false;

  clickHeaderOnMobile() {
    this.active = !this.active;
  }

  logout() {
    this.store.dispatch(new LogoutAction());
  }
}
