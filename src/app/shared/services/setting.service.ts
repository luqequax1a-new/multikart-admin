import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { IAppSetting, IGoogleReCaptcha, ISetting } from '../interface/setting.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private http = inject(HttpClient);

  reCaptchaConfig: IGoogleReCaptcha;

  getSettingOption(): Observable<ISetting> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({} as ISetting);
    // return this.http.get<ISetting>(`${environment.URL}/settings.json`);
  }

  getAppSettingOption(): Observable<IAppSetting> {
    // Demo çağrısı devre dışı - boş veri döndürülüyor
    return of({} as IAppSetting);
    // return this.http.get<IAppSetting>(`${environment.URL}/app/settings`);
  }
  async getReCaptchaConfig(): Promise<void> {
    // const config = await this.getSettingOption().toPromise();
    // this.reCaptchaConfig = config?.values?.google_reCaptcha!;
  }
}
