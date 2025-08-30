import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Store, State, Selector, Action, StateContext } from '@ngxs/store';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AccountClearAction, GetUserDetailsAction } from '../action/account.action';
import {
  ForgotPassWordAction,
  LoginAction,
  VerifyEmailOtpAction,
  UpdatePasswordAction,
  LogoutAction,
  AuthClearAction,
} from '../action/auth.action';
import { GetNotificationAction } from '../action/notification.action';
import { GetSettingOptionAction } from '../action/setting.action';
import { GetBadgesAction } from '../action/sidebar.action';

export interface AuthStateModel {
  email: string;
  token: string | number;
  access_token: string | null;
  permissions: [];
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    email: '',
    token: '',
    access_token: '',
    permissions: [],
  },
})
@Injectable()
export class AuthState {
  private store = inject(Store);
  router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  @Selector()
  static accessToken(state: AuthStateModel) {
    return state.access_token;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel) {
    return !!state.access_token;
  }

  @Selector()
  static email(state: AuthStateModel) {
    return state.email;
  }

  @Selector()
  static token(state: AuthStateModel) {
    return state.token;
  }

  @Action(LoginAction)
  login(ctx: StateContext<AuthStateModel>, _action: LoginAction) {
    this.notificationService.notification = false;
    ctx.patchState({
      email: 'admin@example.com',
      token: '',
      access_token: '115|laravel_sanctum_mp1jyyMyKeE4qVsD1bKrnSycnmInkFXXIrxKv49w49d2a2c5',
      permissions: [],
    });
    this.store.dispatch(new GetUserDetailsAction());
    this.store.dispatch(new GetBadgesAction());
    this.store.dispatch(new GetNotificationAction());
    this.store.dispatch(new GetSettingOptionAction());
  }

  @Action(ForgotPassWordAction)
  forgotPassword(_ctx: StateContext<AuthStateModel>, _action: ForgotPassWordAction) {
    this.notificationService.notification = false;
    // Forgot Password Logic Here
  }

  @Action(VerifyEmailOtpAction)
  verifyEmail(_ctx: StateContext<AuthStateModel>, _action: VerifyEmailOtpAction) {
    this.notificationService.notification = false;
    // Verify Email Logic Here
  }

  @Action(UpdatePasswordAction)
  updatePassword(_ctx: StateContext<AuthStateModel>, _action: UpdatePasswordAction) {
    this.notificationService.notification = false;
    // Update Password Logic Here
  }

  @Action(LogoutAction)
  logout(_ctx: StateContext<AuthStateModel>) {
    this.store.dispatch(new AuthClearAction()).subscribe({
      complete: () => {
        void this.router.navigate(['/auth/login']);
      },
    });
  }

  @Action(AuthClearAction)
  authClear(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      email: '',
      token: '',
      access_token: null,
      permissions: [],
    });
    this.store.dispatch(new AccountClearAction());
  }
}
