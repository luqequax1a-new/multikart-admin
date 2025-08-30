import { Component, inject, DOCUMENT } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { IValues } from '../../../../interface/setting.interface';
import { SettingState } from '../../../../store/state/setting.state';

@Component({
  selector: 'app-mode',
  imports: [NgbTooltip],
  templateUrl: './mode.html',
  styleUrl: './mode.scss',
})
export class Mode {
  private document = inject(DOCUMENT);
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;

  public mode: boolean;

  constructor() {
    this.setting$.subscribe(
      res => (this.mode = res && res.general && res.general.mode === 'dark-only' ? true : false),
    );
    
    // Ensure light mode is default on initialization
    if (!this.document.body.classList.contains('dark-only')) {
      this.mode = false;
    }
  }

  customizeLayoutDark() {
    this.mode = !this.mode;
    this.document.body.classList.toggle('dark-only');
  }
}
