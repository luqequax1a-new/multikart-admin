import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { Button } from '../../../ui/button/button';

export interface ILanguage {
  language: string;
  code: string;
  icon: string;
}

@Component({
  selector: 'app-languages',
  imports: [Button],
  templateUrl: './languages.html',
  styleUrl: './languages.scss',
})
export class Languages {
  private translate = inject(TranslateService);
  private platformId = inject<Object>(PLATFORM_ID);

  public active: boolean = false;
  public languages: ILanguage[] = [
    {
      language: 'English',
      code: 'en',
      icon: 'us',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: 'fr',
    },
  ];

  public selectedLanguage: ILanguage = {
    language: 'English',
    code: 'en',
    icon: 'us',
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      let language = localStorage.getItem('language');

      if (language == null) {
        localStorage.setItem('language', JSON.stringify(this.selectedLanguage));
        this.translate.use(this.selectedLanguage.code);
      } else {
        this.selectedLanguage = JSON.parse(language);
        this.translate.use(this.selectedLanguage.code);
      }
    }
  }

  selectLanguage(language: ILanguage) {
    this.active = false;
    this.translate.use(language.code);
    this.selectedLanguage = language;
  }

  clickHeaderOnMobile() {
    this.active = !this.active;
  }

  hideDropdown() {
    this.active = false;
  }
}
