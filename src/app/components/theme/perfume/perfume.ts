import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, Renderer2, DOCUMENT } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Params } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Select2, Select2Data, Select2Module, Select2SearchEvent } from 'ng-select2-component';
import { Observable, Subject, debounceTime, forkJoin } from 'rxjs';

import { PageWrapper } from '../../../shared/components/page-wrapper/page-wrapper';
import { AdvanceDropdown } from '../../../shared/components/ui/advance-dropdown/advance-dropdown';
import { Button } from '../../../shared/components/ui/button/button';
import { FormFields } from '../../../shared/components/ui/form-fields/form-fields';
import { ImageUpload } from '../../../shared/components/ui/image-upload/image-upload';
import { Link } from '../../../shared/components/ui/link/link';
import { mediaConfig } from '../../../shared/data/media-config';
import { HasPermissionDirective } from '../../../shared/directive/has-permission.directive';
import { ICategoryModel } from '../../../shared/interface/category.interface';
import { IPerfume } from '../../../shared/interface/theme.interface';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetProductsAction } from '../../../shared/store/action/product.action';
import { GetHomePageAction, UpdateHomePageAction } from '../../../shared/store/action/theme.action';
import { BrandState } from '../../../shared/store/state/brand.state';
import { CategoryState } from '../../../shared/store/state/category.state';
import { ProductState } from '../../../shared/store/state/product.state';
import { ThemeState } from '../../../shared/store/state/theme.state';

@Component({
  selector: 'app-perfume',
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    Select2Module,
    HasPermissionDirective,
    NgbModule,
    PageWrapper,
    Button,
    FormFields,
    Link,
    ImageUpload,
    AdvanceDropdown,
  ],
  templateUrl: './perfume.html',
  styleUrl: './perfume.scss',
})
export class Perfume {
  private store = inject(Store);
  formBuilder = inject(FormBuilder);
  private renderer = inject(Renderer2);
  private document = inject<Document>(DOCUMENT);

  home_page$: Observable<IPerfume> = inject(Store).select(ThemeState.homePage);
  product$: Observable<Select2Data> = inject(Store).select(ProductState.products);
  category$: Observable<ICategoryModel> = inject(Store).select(
    CategoryState.category,
  ) as Observable<ICategoryModel>;
  categories$: Observable<Select2Data> = inject(Store).select(CategoryState.categories);
  brand$: Observable<Select2Data> = inject(Store).select(BrandState.brands);

  public page_data: IPerfume;
  public active = 'home_banner';
  public form: FormGroup;
  public banner = 1;
  public sliderProducts = 1;
  public selectedCategories: number[] = [];
  private search = new Subject<string>();
  public filter = {
    status: 1,
    search: '',
    paginate: 15,
    ids: '',
    with_union_products: 0,
    is_approved: 1,
  };
  public mediaConfig = mediaConfig;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
    this.form = new FormGroup({
      content: new FormGroup({
        home_banner: new FormGroup({
          status: new FormControl(true),
          image_url: new FormControl(''),
          redirect_link: new FormGroup({
            link: new FormControl(''),
            link_type: new FormControl(''),
            product_ids: new FormControl(''),
          }),
        }),
        offer_banner_1: new FormGroup({
          banner_1: new FormGroup({
            status: new FormControl(true),
            image_url: new FormControl(),
            redirect_link: new FormGroup({
              link: new FormControl(''),
              link_type: new FormControl(''),
              product_ids: new FormControl(''),
            }),
          }),
          banner_2: new FormGroup({
            status: new FormControl(true),
            image_url: new FormControl(),
            redirect_link: new FormGroup({
              link: new FormControl(''),
              link_type: new FormControl(''),
              product_ids: new FormControl(''),
            }),
          }),
          banner_3: new FormGroup({
            status: new FormControl(true),
            image_url: new FormControl(),
            redirect_link: new FormGroup({
              link: new FormControl(''),
              link_type: new FormControl(''),
              product_ids: new FormControl(''),
            }),
          }),
          banner_4: new FormGroup({
            status: new FormControl(true),
            image_url: new FormControl(),
            redirect_link: new FormGroup({
              link: new FormControl(''),
              link_type: new FormControl(''),
              product_ids: new FormControl(''),
            }),
          }),
        }),
        category_product: new FormGroup({
          title: new FormControl(''),
          tag: new FormControl(''),
          category_ids: new FormControl([]),
          status: new FormControl(true),
        }),
        offer_banner_2: new FormGroup({
          status: new FormControl(true),
          image_url: new FormControl(''),
          redirect_link: new FormGroup({
            link: new FormControl(''),
            link_type: new FormControl(''),
            product_ids: new FormControl(''),
          }),
        }),
        collection_banner: new FormGroup({
          status: new FormControl(true),
          image_url: new FormControl(''),
          redirect_link: new FormGroup({
            link: new FormControl(''),
            link_type: new FormControl(''),
            product_ids: new FormControl(''),
          }),
        }),
        product_list: new FormGroup({
          status: new FormControl(true),
          products: new FormGroup({
            product_ids: new FormControl([]),
            status: new FormControl(true),
          }),
          left_panel: new FormGroup({
            title: new FormControl(''),
            description: new FormControl(''),
            more_button: new FormControl(false),
            button_text: new FormControl(''),
            status: new FormControl(true),
            redirect_link: new FormGroup({
              link: new FormControl(''),
              link_type: new FormControl(''),
              product_ids: new FormControl(''),
            }),
          }),
        }),
        brand: new FormGroup({
          brand_ids: new FormControl(''),
          status: new FormControl(true),
        }),
        products_ids: new FormControl([]),
      }),
      slug: new FormControl('perfume'),
    });
  }

  ngOnInit() {
    const categories$ = this.store.dispatch(
      new GetCategoriesAction({ status: 1, type: 'product' }),
    );
    const home_page$ = this.store.dispatch(new GetHomePageAction({ slug: 'perfume' }));
    const brand$ = this.store.dispatch(new GetBrandsAction({ status: 1 }));

    forkJoin([home_page$, categories$, brand$]).subscribe({
      complete: () => {
        this.store.select(ThemeState.homePage).subscribe({
          next: homePage => {
            if (homePage?.content?.products_ids) {
              this.filter['paginate'] =
                homePage?.content?.products_ids?.length >= 15
                  ? homePage?.content?.products_ids?.length
                  : 15;
              this.filter['ids'] = homePage?.content?.products_ids?.join();
              this.filter['with_union_products'] = homePage?.content?.products_ids?.length
                ? homePage?.content?.products_ids?.length >= 15
                  ? 0
                  : 1
                : 0;
            }
            this.store.dispatch(new GetProductsAction(this.filter)).subscribe({
              complete: () => {
                this.patchForm();
              },
            });
          },
        });
      },
    });

    this.search
      .pipe(debounceTime(300)) // Adjust the debounce time as needed (in milliseconds)
      .subscribe(inputValue => {
        this.store.dispatch(
          new GetProductsAction({ status: 1, is_approved: 1, paginate: 15, search: inputValue }),
        );
        this.renderer.addClass(this.document.body, 'loader-none');
      });
  }

  patchForm() {
    this.home_page$.subscribe(homePage => {
      this.selectedCategories = homePage?.content?.category_product?.category_ids || [];
      this.page_data = homePage;
      this.form.patchValue({
        content: {
          home_banner: {
            image_url: homePage?.content?.home_banner?.image_url,
            redirect_link: {
              link: homePage?.content?.home_banner?.redirect_link?.link,
              link_type: homePage?.content?.home_banner?.redirect_link?.link_type,
              product_ids: homePage?.content?.home_banner?.redirect_link?.product_ids,
            },
          },
          offer_banner_1: {
            banner_1: {
              status: homePage?.content?.offer_banner_1?.banner_1?.status,
              image_url: homePage?.content?.offer_banner_1?.banner_1?.image_url,
              redirect_link: {
                link: homePage?.content?.offer_banner_1?.banner_1?.redirect_link?.link,
                link_type: homePage?.content?.offer_banner_1?.banner_1?.redirect_link?.link_type,
                product_ids:
                  homePage?.content?.offer_banner_1?.banner_1?.redirect_link?.product_ids,
              },
            },
            banner_2: {
              status: homePage?.content?.offer_banner_1?.banner_2?.status,
              image_url: homePage?.content?.offer_banner_1?.banner_2?.image_url,
              redirect_link: {
                link: homePage?.content?.offer_banner_1?.banner_2?.redirect_link?.link,
                link_type: homePage?.content?.offer_banner_1?.banner_2?.redirect_link?.link_type,
                product_ids:
                  homePage?.content?.offer_banner_1?.banner_2?.redirect_link?.product_ids,
              },
            },
            banner_3: {
              status: homePage?.content?.offer_banner_1?.banner_3?.status,
              image_url: homePage?.content?.offer_banner_1?.banner_3?.image_url,
              redirect_link: {
                link: homePage?.content?.offer_banner_1?.banner_3?.redirect_link?.link,
                link_type: homePage?.content?.offer_banner_1?.banner_3?.redirect_link?.link_type,
                product_ids:
                  homePage?.content?.offer_banner_1?.banner_3?.redirect_link?.product_ids,
              },
            },
            banner_4: {
              status: homePage?.content?.offer_banner_1?.banner_4?.status,
              image_url: homePage?.content?.offer_banner_1?.banner_4?.image_url,
              redirect_link: {
                link: homePage?.content?.offer_banner_1?.banner_4?.redirect_link?.link,
                link_type: homePage?.content?.offer_banner_1?.banner_4?.redirect_link?.link_type,
                product_ids:
                  homePage?.content?.offer_banner_1?.banner_4?.redirect_link?.product_ids,
              },
            },
          },
          category_product: {
            title: homePage?.content?.category_product?.title,
            tag: homePage?.content?.category_product?.tag,
            category_ids: homePage?.content?.category_product?.category_ids,
            status: homePage?.content?.category_product?.status,
          },
          collection_banner: {
            image_url: homePage?.content?.collection_banner?.image_url,
            status: homePage?.content?.collection_banner?.status,
            redirect_link: {
              link: homePage?.content?.collection_banner?.redirect_link?.link,
              link_type: homePage?.content?.collection_banner?.redirect_link?.link_type,
              product_ids: homePage?.content?.collection_banner?.redirect_link?.product_ids,
            },
          },
          product_list: {
            status: homePage?.content?.product_list?.status,
            left_panel: {
              title: homePage?.content?.product_list?.left_panel?.title,
              description: homePage?.content?.product_list?.left_panel?.description,
              more_button: homePage?.content?.product_list?.left_panel?.more_button,
              button_text: homePage?.content?.product_list?.left_panel?.button_text,
              status: homePage?.content?.product_list?.left_panel?.status,
              redirect_link: {
                link: homePage?.content?.product_list?.left_panel?.redirect_link?.link,
                link_type: homePage?.content?.product_list?.left_panel?.redirect_link?.link_type,
                product_ids:
                  homePage?.content?.product_list?.left_panel?.redirect_link?.product_ids,
              },
            },
            products: {
              product_ids: homePage?.content?.product_list?.products?.product_ids,
            },
          },
          offer_banner_2: {
            status: homePage?.content?.offer_banner_2?.status,
            image_url: homePage?.content?.offer_banner_2?.image_url,
            redirect_link: {
              link: homePage?.content?.offer_banner_2?.redirect_link?.link,
              link_type: homePage?.content?.offer_banner_2?.redirect_link?.link_type,
              product_ids: homePage?.content?.offer_banner_2?.redirect_link?.product_ids,
            },
          },
          brand: {
            brand_ids: homePage?.content?.brand?.brand_ids,
            status: homePage?.content?.brand?.status,
          },
          products_ids: homePage?.content?.products_ids,
        },
        slug: homePage?.slug,
      });
    });
  }

  selectCategoryItem(data: Number[], key: string) {
    if (Array.isArray(data)) {
      this.form.get(key)?.setValue(data);
    }
  }

  getProducts(filter: Params) {
    this.filter['search'] = filter['search'];
    this.filter['ids'] = this.filter['search'].length
      ? ''
      : this.page_data?.content?.products_ids?.join();
    this.filter['paginate'] =
      this.page_data?.content?.products_ids?.length >= 15
        ? this.page_data?.content?.products_ids?.length
        : 15;
    this.store.dispatch(new GetProductsAction(this.filter));
    this.renderer.addClass(this.document.body, 'loader-none');
  }

  productDropdown(event: Select2) {
    if (event['innerSearchText']) {
      this.search.next('');
      this.getProducts(this.filter);
    }
  }

  searchProduct(event: Select2SearchEvent) {
    this.search.next(event.search);
  }

  selectImage(url: string, key: string) {
    this.form.get(key)?.setValue(url ? url : null);
  }

  // Merge Products Ids
  concatDynamicProductKeys(obj: IPerfume): number[] {
    const result: number[] = [];

    function traverse(value: unknown): void {
      if (Array.isArray(value)) {
        value.forEach(traverse);
      } else if (value !== null && typeof value === 'object') {
        for (const [key, nested] of Object.entries(value)) {
          if (
            key === 'product_ids' &&
            Array.isArray(nested) &&
            nested.every(item => typeof item === 'number')
          ) {
            result.push(...nested);
          } else if (key === 'product_ids' && typeof nested === 'number') {
            result.push(nested);
          } else {
            traverse(nested);
          }
        }
      }
    }

    traverse(obj);
    return result;
  }

  submit() {
    const productIds = Array.from(new Set(this.concatDynamicProductKeys(this.form.value)));
    this.form.get('content.products_ids')?.setValue(productIds);

    if (this.form.valid) {
      this.store.dispatch(new UpdateHomePageAction(this.page_data.id, this.form.value));
    }
  }
}
