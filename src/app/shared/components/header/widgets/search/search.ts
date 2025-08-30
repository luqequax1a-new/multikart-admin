import { Component, ElementRef, Renderer2, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { menu } from '../../../../data/menu';
import { ISidebar } from '../../../../interface/sidebar.interface';
import { NavService } from '../../../../services/nav.service';

@Component({
  selector: 'app-search',
  imports: [TranslateModule, RouterModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  navServices = inject(NavService);
  private renderer = inject(Renderer2);

  public menuItems: ISidebar[];
  public items: ISidebar[] = menu;

  public searchResult: boolean = false;
  public searchResultEmpty: boolean = false;
  public text: string;
  public open = false;

  readonly toggleButton = viewChild<ElementRef>('toggleButton');
  readonly menu = viewChild<ElementRef>('menu');
  readonly dropdownContainer = viewChild<ElementRef>('dropdownContainer');

  closeSearch() {
    this.navServices.search = false;
  }

  openDropDown(text: string) {
    text && (this.searchResult = !this.searchResult);
    var element = document.getElementsByTagName('body')[0];
    element.classList.toggle('overlay-search');
  }

  searchTerm(term?: string) {
    // if (!term) return (this.menuItems = []);
    if (term) {
      this.addFix();
      let items: ISidebar[] = [];
      term = term.toLowerCase();
      this.items.filter(menuItems => {
        if (!menuItems?.title) return false;

        if (menuItems.title.toLowerCase().includes(term!) && menuItems.type === 'link') {
          items.push(menuItems);
        }
        if (!menuItems.children) return false;
        menuItems.children.filter(subItems => {
          if (subItems && subItems.title) {
            if (subItems.title.toLowerCase().includes(term!) && subItems.type === 'link') {
              subItems.icon = menuItems.icon;
              items.push(subItems);
            }
          }
          if (!subItems.children) return false;
          subItems.children.filter(suSubItems => {
            if (suSubItems && suSubItems.title) {
              if (suSubItems.title.toLowerCase().includes(term!)) {
                suSubItems.icon = menuItems.icon;
                items.push(suSubItems);
              }
            }
          });
          return items;
        });
        return (this.checkSearchResultEmpty(items), (this.menuItems = items));
      });
    } else {
      this.removeFix();
      return (this.menuItems = []);
    }
    return this.menuItems;
  }

  checkSearchResultEmpty(items: ISidebar[]) {
    if (!items.length) this.searchResultEmpty = true;
    else this.searchResultEmpty = false;
  }

  addFix() {
    this.searchResult = true;
    document.getElementsByTagName('body')[0].classList.add('overlay-search');
  }

  removeFix() {
    this.searchResult = false;
    this.text = '';
    document.getElementsByTagName('body')[0].classList.remove('overlay-search');
  }

  clickOutside(): void {
    this.searchResult = false;
  }
}
