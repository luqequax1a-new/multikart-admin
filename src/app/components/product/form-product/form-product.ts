import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  PLATFORM_ID,
  Renderer2,
  DOCUMENT,
  viewChild,
  input,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbModule,
  NgbNav,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import {
  Select2,
  Select2Data,
  Select2Module,
  Select2SearchEvent,
  Select2UpdateEvent,
} from 'ng-select2-component';
import { Editor, NgxEditorModule } from 'ngx-editor';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  map,
  mergeMap,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';

import { AdvanceDropdown } from '../../../shared/components/ui/advance-dropdown/advance-dropdown';
import { Button } from '../../../shared/components/ui/button/button';
import { FormFields } from '../../../shared/components/ui/form-fields/form-fields';
import { ImageUpload } from '../../../shared/components/ui/image-upload/image-upload';
import { IMediaConfig, mediaConfig } from '../../../shared/data/media-config';
import { IAccountUser } from '../../../shared/interface/account.interface';
import { IAttachment } from '../../../shared/interface/attachment.interface';
import { ICategoryModel } from '../../../shared/interface/category.interface';
import {
  IProduct,
  IVariant,
  IVariation,
  IVariationCombination,
  IWholesalePrice,
} from '../../../shared/interface/product.interface';
import { IValues } from '../../../shared/interface/setting.interface';
import { ITagModel } from '../../../shared/interface/tag.interface';
import {
  GetAttributeValuesAction,
  GetAttributesAction,
} from '../../../shared/store/action/attribute.action';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import {
  CreateProductAction,
  DeleteProductAction,
  EditProductAction,
  GetProductsAction,
  UpdateProductAction,
} from '../../../shared/store/action/product.action';
import { GetStoresAction } from '../../../shared/store/action/store.action';
import { GetTagsAction } from '../../../shared/store/action/tag.action';
import { GetTaxesAction } from '../../../shared/store/action/tax.action';
import { AccountState } from '../../../shared/store/state/account.state';
import { AttributeState } from '../../../shared/store/state/attribute.state';
import { BrandState } from '../../../shared/store/state/brand.state';
import { CategoryState } from '../../../shared/store/state/category.state';
import { ProductState } from '../../../shared/store/state/product.state';
import { SettingState } from '../../../shared/store/state/setting.state';
import { StoreState } from '../../../shared/store/state/store.state';
import { TagState } from '../../../shared/store/state/tag.state';
import { TaxState } from '../../../shared/store/state/tax.state';
import { priceValidator } from '../../../shared/validator/price-validator';
import { ProductService } from '../../../shared/services/product.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { UnitsService } from '../../units/units.service';
import { IUnit } from '../../units/units.interface';

function convertToNgbDate(date: NgbDateStruct): NgbDate {
  return new NgbDate(date.year, date.month, date.day);
}

@Component({
  selector: 'app-form-product',
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    Select2Module,
    NgxEditorModule,
    FormFields,
    ImageUpload,
    Button,
    AdvanceDropdown,
  ],
  templateUrl: './form-product.html',
  styleUrl: './form-product.scss',
})
export class FormProduct {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private unitsService = inject(UnitsService);

  readonly type = input<string>(undefined);

  readonly nav = viewChild<NgbNav>('nav');

  user$: Observable<IAccountUser> = inject(Store).select(AccountState.user);
  product$: Observable<IProduct> = inject(Store).select(
    ProductState.selectedProduct,
  ) as Observable<IProduct>;
  products$: Observable<Select2Data> = inject(Store).select(ProductState.products);
  store$: Observable<Select2Data> = inject(Store).select(StoreState.stores);
  category$: Observable<ICategoryModel> = inject(Store).select(
    CategoryState.category,
  ) as Observable<ICategoryModel>;
  tag$: Observable<ITagModel> = inject(Store).select(TagState.tag);
  tax$: Observable<Select2Data> = inject(Store).select(TaxState.taxes);
  units$: Observable<Select2Data> = this.unitsService.list({ is_active: 1 }).pipe(
    map(units => units.map(unit => ({ value: unit.id, label: unit.text })))
  );
  
  selectedUnit: IUnit | null = null;
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  brand$: Observable<Select2Data> = inject(Store).select(BrandState.brands);
  categories$: Observable<Select2Data> = inject(Store).select(CategoryState.categories);

  public attribute$: Observable<Select2Data>;
  public active = 'general';
  public tabError: string[] | null = [];
  public form: FormGroup;
  public id: number;
  public selectedCategories: number[] = [];
  public selectedTags: number[] = [];
  public variationCombinations: IVariationCombination[] = [];
  public retrieveVariants: boolean = false;
  public variantCount: number = 0;
  public fromDate: NgbDate | null;
  public toDate: NgbDate | null;
  public hoveredDate: NgbDate | null = null;
  public collectionProduct: Select2Data;
  public product: IProduct;
  private destroy$ = new Subject<void>();
  public mediaConfig: IMediaConfig = mediaConfig;
  public editor: Editor;
  public html = '';
  public isCodeEditor = true;
  public mainProductType: Select2Data = [
    {
      value: 'physical',
      label: 'Physical Product',
    },
    {
      value: 'digital',
      label: 'Digital Product',
    },
    {
      value: 'external',
      label: 'External/Affiliate product',
    },
  ];

  public productType: Select2Data = [
    {
      value: 'simple',
      label: 'Simple Product',
    },
    {
      value: 'classified',
      label: 'Variable Product',
    },
  ];

  public stocks: Select2Data = [
    {
      value: 'in_stock',
      label: 'In Stock',
    },
    {
      value: 'out_of_stock',
      label: 'Out of Stock',
    },
  ];

  public wholesalePriceType: Select2Data = [
    {
      value: 'fixed',
      label: 'Fixed',
    },
    {
      value: 'percentage',
      label: 'Percentage',
    },
  ];

  public separators: Select2Data = [
    {
      value: 'comma',
      label: 'Comma ( , )',
    },
    {
      value: 'semicolon',
      label: 'Semicolon ( ; )',
    },
    {
      value: 'pipe',
      label: 'Pipe ( | )',
    },
  ];

  public waterMakrPosition: Select2Data = [
    {
      value: 'top-left',
      label: 'Top Left',
    },
    {
      value: 'top',
      label: 'Top',
    },
    {
      value: 'top-right',
      label: 'Top Right',
    },
    {
      value: 'left',
      label: 'Left',
    },
    {
      value: 'center',
      label: 'Center',
    },
    {
      value: 'right',
      label: 'Right',
    },
    {
      value: 'bottom-left',
      label: 'Bottom Left',
    },
    {
      value: 'bottom',
      label: 'Bottom',
    },
    {
      value: 'bottom-right',
      label: 'Bottom Right',
    },
  ];

  public previewType: Select2Data = [
    {
      value: 'video',
      label: 'Video',
    },
    {
      value: 'audio',
      label: 'Audio',
    },
    {
      value: 'url',
      label: 'URL',
    },
  ];

  public filter = {
    search: '',
    paginate: 15,
    ids: '',
    with_union_products: 0,
    is_approved: 1,
  };

  public variants: IVariant[] = [
    {
      id: null,
      attribute_values: null,
      options: null,
      variant_option: null,
    },
  ];
  public variations: IVariation[] = [];

  public wholesalePrices: IWholesalePrice[] = [];
  public isBrowser: boolean;
  private search = new Subject<string>();
  public textArea = new FormControl('');
  public slugTouched = false;
  public coverImageIndex: number = 0;
  
  constructor() {
    const platformId = this.platformId;

    this.isBrowser = isPlatformBrowser(platformId);
    this.store.dispatch(new GetStoresAction({ status: 1, is_approved: 1 }));
    this.store.dispatch(new GetAttributesAction({ status: 1 }));
    this.store.dispatch(new GetAttributeValuesAction({ status: 1 }));
    this.store.dispatch(new GetCategoriesAction({ type: 'product', status: 1 }));
    this.store.dispatch(new GetTagsAction({ type: 'product', status: 1 }));
    this.store.dispatch(new GetTaxesAction({ status: 1 }));
    this.store.dispatch(new GetBrandsAction({ status: 1 }));

    this.attribute$ = this.store
      .select(AttributeState.attributes)
      .pipe(map(filterFn => filterFn('')));

    this.form = this.formBuilder.group({
      product_type: new FormControl('physical', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      slug: new FormControl(''),
      short_description: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      store_id: new FormControl(),
      type: new FormControl('simple', [Validators.required]),
      digital_file_ids: new FormControl(),
      preview_type: new FormControl('url'),
      preview_audio_file_id: new FormControl(),
      preview_video_file_id: new FormControl(),
      is_licensable: new FormControl(0),
      is_licensekey_auto: new FormControl(0),
      license_key: new FormControl(),
      separator: new FormControl(),
      preview_url: new FormControl(),
      is_external: new FormControl(0),
      external_url: new FormControl(),
      external_button_text: new FormControl(),
      unit: new FormControl(),
      weight: new FormControl(),
      stock_status: new FormControl('in_stock', []),
      sku: new FormControl('', [Validators.required]),
      unit_id: new FormControl('', [Validators.required]),
      stock_qty: new FormControl('', [Validators.required]),
      min_qty: new FormControl(''),
      max_qty: new FormControl(''),
      price: new FormControl('', [Validators.required, priceValidator]),
      tax_rate: new FormControl('', [Validators.required]),
      discount: new FormControl(),
      wholesale_price_type: new FormControl(),
      wholesale_prices: this.formBuilder.array([], []),
      is_sale_enable: new FormControl(0),
      sale_starts_at: new FormControl(),
      sale_expired_at: new FormControl(),
      tags: new FormControl(),
      categories: new FormControl('', [Validators.required]),
      category_ids: new FormControl([], [Validators.required]),
      brand_id: new FormControl(''),
      is_random_related_products: new FormControl(0),
      related_products: new FormControl(),
      cross_sell_products: new FormControl([]),
      product_thumbnail_id: new FormControl(),
      watermark: new FormControl(0),
      watermark_position: new FormControl('center'),
      watermark_image_id: new FormControl(),
      product_galleries_id: new FormControl(),
      size_chart_image_id: new FormControl(),
      is_active: new FormControl(1, [Validators.required]),
      variants: this.formBuilder.array([], []),
      variations: this.formBuilder.array([], []),
      attributes_ids: new FormControl([]),
      meta_title: new FormControl(),
      meta_description: new FormControl(),
      canonical_url: new FormControl(),
      product_meta_image_id: new FormControl(),
      safe_checkout: new FormControl(1),
      secure_checkout: new FormControl(1),
      social_share: new FormControl(1),
      encourage_order: new FormControl(1),
      encourage_view: new FormControl(1),
      is_free_shipping: new FormControl(0),
      tax_id: new FormControl('', [Validators.required]),
      estimated_delivery_text: new FormControl(),
      return_policy_text: new FormControl(),
      is_featured: new FormControl(0),
      is_trending: new FormControl(0),
      is_return: new FormControl(0),
      status: new FormControl(1),
    });
  }

  getText(_event: Event) {
    this.form.controls['description'].setValue(this.textArea.value);
  }

  getData(_description: Event) {
    this.textArea.setValue(this.html);
  }

  get variantControl(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  get variationControl(): FormArray {
    return this.form.get('variations') as FormArray;
  }

  get wholesalePriceControl(): FormArray {
    return this.form.get('wholesale_prices') as FormArray;
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.editor = new Editor();
    }
    const type = this.type();
    if (type == 'create') {
      this.store.dispatch(new GetProductsAction(this.filter));
    }
    this.search
      .pipe(debounceTime(300))
      .subscribe(inputValue => {
        this.renderer.addClass(this.document.body, 'loader-none');
        this.filter['search'] = inputValue;
        if (inputValue) {
          this.store.dispatch(new GetProductsAction(this.filter));
        }
      });

    this.route.params
      .pipe(
        switchMap(params => {
          if (!params['id']) return of();
          this.id = +params['id'];
          return this.productService.getById(this.id);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(product => {
        if (product?.related_products && product?.cross_sell_products) {
          let array = [...product?.related_products, ...product?.cross_sell_products];
          this.filter['paginate'] = array?.length >= 15 ? array?.length : 15;
          this.filter['ids'] = array?.join();
          this.filter['with_union_products'] = array?.length ? (array?.length >= 15 ? 0 : 1) : 0;
        }

        this.store.dispatch(new GetProductsAction(this.filter)).subscribe({
          next: () => {
            this.fromDate = product?.sale_starts_at
              ? convertToNgbDate(this.formatter.parse(product?.sale_starts_at)!)
              : null;
            this.toDate = product?.sale_expired_at
              ? convertToNgbDate(this.formatter.parse(product?.sale_expired_at)!)
              : null;

            this.selectedCategories = product?.categories.map(value => value?.id!)!;
            this.selectedTags = product?.tags.map(value => value?.id!)!;

            let attributes = product?.attributes?.map(value => value?.id);
            let galleries = product?.product_galleries?.map(value => value?.id);
            let digitalFiles = product?.digital_files?.map(value => value?.id);
            let separator = ',';
            if (product?.separator == 'comma') {
              separator = ',';
            } else if (product?.separator == 'semicolon') {
              separator = ';';
            } else if (product?.separator == 'pipe') {
              separator = '|';
            }
            let licenseKeys = product?.license_keys
              ?.map(value => value.license_key)
              .join(separator);

            if (product) this.product = product;
            this.id = product?.id!;
            this.form.patchValue({
              product_type: product?.product_type ? product?.product_type : 'physical',
              name: product?.name,
              short_description: product?.short_description,
              description: product?.description,
              store_id: product?.store_id,
              type: product?.type,
              is_external: product?.is_external,
              external_url: product?.external_url,
              external_button_text: product?.external_button_text,
              is_licensable: product?.is_licensable,
              is_licensekey_auto: product?.is_licensekey_auto,
              separator: product?.separator,
              license_key: licenseKeys,
              digital_file_ids: digitalFiles,
              preview_type: product?.preview_type,
              preview_video_file_id: product?.preview_video_file_id,
              preview_audio_file_id: product?.preview_audio_file_id,
              preview_url: product?.preview_url,
              wholesale_price_type: product?.wholesale_price_type,
              unit: product?.unit,
              unit_id: product?.unit_id,
              weight: product?.weight,
              stock_status: product?.stock_status,
              sku: product?.sku,
              quantity: product?.quantity,
              price: product?.price,
              discount: product?.discount,
              is_sale_enable: product?.is_sale_enable,
              sale_starts_at: product?.sale_starts_at,
              sale_expired_at: product?.sale_expired_at,
              tags: this.selectedTags,
              categories: this.selectedCategories,
              brand_id: product?.brand_id,
              is_random_related_products: product?.is_random_related_products,
              related_products: product?.related_products,
              cross_sell_products: product?.cross_sell_products,
              product_thumbnail_id: product?.product_thumbnail_id,
              product_galleries_id: galleries,
              watermark: 0,
              watermark_position: product?.watermark_position,
              watermark_image_id: product?.watermark_image_id,
              size_chart_image_id: product?.size_chart_image_id,
              attributes_ids: attributes,
              is_active: product?.is_active ?? 1,
              meta_title: product?.meta_title,
              meta_description: product?.meta_description,
              canonical_url: product?.canonical_url,
              product_meta_image_id: product?.product_meta_image_id,
              safe_checkout: product?.safe_checkout,
              secure_checkout: product?.secure_checkout,
              social_share: product?.social_share,
              encourage_order: product?.encourage_order,
              encourage_view: product?.encourage_view,
              is_free_shipping: product?.is_free_shipping,
              is_return: product?.is_return,
              tax_id: product?.tax_id,
              estimated_delivery_text: product?.estimated_delivery_text,
              return_policy_text: product?.return_policy_text,
              is_featured: product?.is_featured,
              is_trending: product?.is_trending,
              status: product?.status,
            });

            if (product?.unit_id) {
              this.unitsService.list({ is_active: 1 }).subscribe(units => {
                this.selectedUnit = units.find(unit => unit.id === product.unit_id) || null;
              });
            }
          }
        });
      });

    this.form.get('name')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(name => {
        if (name && this.type() === 'create') {
          const slug = this.generateSlug(name);
          this.form.get('slug')?.setValue(slug, { emitEvent: false });
        }
      });
  }

  productDropdown(event: Select2) {
    if (event?.value) {
      this.search.next(String(event.value));
    }
  }

  searchProduct(event: Select2SearchEvent) {
    this.search.next(event.search);
  }

  onUnitChange(event: Select2UpdateEvent) {
    const unitId = event.value;
    if (unitId) {
      this.unitsService.list({ is_active: 1 }).subscribe(units => {
        this.selectedUnit = units.find(unit => unit.id === unitId) || null;
        this.updateStockValidators();
      });
    } else {
      this.selectedUnit = null;
      this.updateStockValidators();
    }
  }

  onQuantityBlur(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    const step = this.selectedUnit?.step || 1;
    
    if (!isNaN(value) && step !== 1) {
      const rounded = Math.round(value / step) * step;
      target.value = rounded.toString();
    }
  }

  getQuantityStep(): string {
    return this.selectedUnit?.step?.toString() || '1';
  }

  updateStockValidators() {
    const stockQtyControl = this.form.get('stock_qty');
    const minQtyControl = this.form.get('min_qty');
    const maxQtyControl = this.form.get('max_qty');
    
    if (this.selectedUnit?.step === 1) {
      stockQtyControl?.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);
      minQtyControl?.setValidators([Validators.pattern(/^\d+$/)]);
      maxQtyControl?.setValidators([Validators.pattern(/^\d+$/)]);
    } else {
      stockQtyControl?.setValidators([Validators.required, Validators.min(0)]);
      minQtyControl?.setValidators([Validators.min(0)]);
      maxQtyControl?.setValidators([Validators.min(0)]);
    }
    
    stockQtyControl?.updateValueAndValidity();
    minQtyControl?.updateValueAndValidity();
    maxQtyControl?.updateValueAndValidity();
  }

  getDecimalPlaces(step: number): number {
    const stepStr = step.toString();
    if (stepStr.indexOf('.') !== -1) {
      return stepStr.split('.')[1].length;
    }
    return 0;
  }

  getUnitLabel(): string {
    return this.selectedUnit?.text || '';
  }

  onPriceInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let value = target.value;
    
    if (value.includes(',')) {
      value = value.replace(',', '.');
      target.value = value;
      this.form.get('price')?.setValue(value);
    }
  }

  goBackToList() {
    this.router.navigate(['/product']);
  }

  private turkishToEnglish(text: string): string {
    const charMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    return text.replace(/[çğıöşüÇĞİÖŞÜ]/g, (match) => charMap[match] || match);
  }

  private generateSlug(name: string): string {
    return this.turkishToEnglish(name)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  onNameInput() {
    if (this.slugTouched) return;
    const name = this.form.value.name || '';
    this.form.patchValue({ slug: this.slugify(name) }, { emitEvent: false });
  }

  onSlugInput() {
    this.slugTouched = true;
  }

  slugify(s: string) {
    return s
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
      || 'urun';
  }

  addVariant(event: Event) {
    event.preventDefault();
    this.variantControl.push(
      this.formBuilder.group({
        id: [null],
        attribute_values: [null],
        options: [null],
        variant_option: [null],
      }),
    );
  }

  removeVariant(index: number) {
    this.variantControl.removeAt(index);
  }

  addWholesalePrice(event: Event) {
    event.preventDefault();
    this.wholesalePriceControl.push(
      this.formBuilder.group({
        id: [null],
        min_qty: ['', [Validators.required]],
        max_qty: ['', [Validators.required]],
        value: ['', [Validators.required]],
      }),
    );
  }

  removeWholesalePrice(index: number) {
    this.wholesalePriceControl.removeAt(index);
  }

  getAttributeValues(id: number | null): Observable<any> {
    return this.store.select(AttributeState.attribute_value).pipe(map(filterFn => filterFn(id)));
  }

  updateAttribute(data: Select2UpdateEvent, index: number) {
    let variants = this.variantControl.value;
    variants[index]['attribute_values'] = null;
    variants[index]['options'] = null;
    variants[index]['variant_option'] = null;
    this.variantControl.patchValue(variants);
    
    if (data.value) {
      this.getAttributeValues(+data.value).subscribe({
        next: attributeValues => {
          variants[index]['options'] = attributeValues;
          this.variantControl.patchValue(variants);
        }
      });
    }
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  updateAttributeValue(data: Select2UpdateEvent, index: number) {
    let variants = this.variantControl.value;
    variants[index]['variant_option'] = data.value;
    this.variantControl.patchValue(variants);
  }

  clearVariations() {
    while (this.variationControl.length !== 0) {
      this.variationControl.removeAt(0);
    }
  }

  addVariation() {
    let variants = this.variantControl.value;
    let combinations = this.generateCombinations(variants);
    this.clearVariations();
    combinations?.forEach((combination: any) => {
      this.variationControl.push(
        this.formBuilder.group({
          id: [combination?.id ? combination?.id : null],
          price: [combination?.price ? combination?.price : '', [Validators.required]],
          sale_price: [combination?.sale_price ? combination?.sale_price : ''],
          sku: [combination?.sku ? combination?.sku : '', [Validators.required]],
          stock_status: [combination?.stock_status ? combination?.stock_status : 'in_stock'],
          quantity: [combination?.quantity ? combination?.quantity : '', [Validators.required]],
          variation_image_id: [combination?.variation_image_id ? combination?.variation_image_id : null],
          variation_galleries_id: [combination?.variation_galleries_id ? combination?.variation_galleries_id : []],
          variation_digital_file_ids: [combination?.variation_digital_file_ids ? combination?.variation_digital_file_ids : []],
          attribute_values: [combination?.attribute_values ? combination?.attribute_values : []],
          discount: [combination?.discount ? combination?.discount : ''],
          is_sale_enable: [combination?.is_sale_enable ? combination?.is_sale_enable : 0],
          sale_starts_at: [combination?.sale_starts_at ? combination?.sale_starts_at : ''],
          sale_expired_at: [combination?.sale_expired_at ? combination?.sale_expired_at : ''],
          is_licensable: [combination?.is_licensable ? combination?.is_licensable : 0],
          is_licensekey_auto: [combination?.is_licensekey_auto ? combination?.is_licensekey_auto : 0],
          separator: [combination?.separator ? combination?.separator : 'comma'],
          license_key: [combination?.license_key ? combination?.license_key : ''],
          preview_type: [combination?.preview_type ? combination?.preview_type : 'url'],
          preview_audio_file_id: [combination?.preview_audio_file_id ? combination?.preview_audio_file_id : null],
          preview_video_file_id: [combination?.preview_video_file_id ? combination?.preview_video_file_id : null],
          preview_url: [combination?.preview_url ? combination?.preview_url : ''],
          is_external: [combination?.is_external ? combination?.is_external : 0],
          external_url: [combination?.external_url ? combination?.external_url : ''],
          external_button_text: [combination?.external_button_text ? combination?.external_button_text : ''],
          status: [combination?.status ? combination?.status : 1],
        }),
      );
    });
  }

  removeVariation(index: number) {
    this.variationControl.removeAt(index);
  }

  selectCategoryItem(data: any) {
    this.selectedCategories = data;
    this.form.controls['category_ids'].setValue(data);
  }

  selectTagItem(data: number[]) {
    this.selectedTags = data;
    this.form.controls['tags'].setValue(data);
  }

  selectThumbnail(data: IAttachment) {
    this.form.controls['product_thumbnail_id'].setValue(data?.id);
  }

  selectImages(data: IAttachment) {
    this.form.controls['product_galleries_id'].setValue(data?.id);
  }

  selectSizeImage(data: IAttachment) {
    this.form.controls['size_chart_image_id'].setValue(data?.id);
  }

  selectMetaImage(data: IAttachment) {
    this.form.controls['product_meta_image_id'].setValue(data?.id);
  }

  selectVariationImage(data: IAttachment, index: number) {
    this.variationControl.at(index).get('variation_image_id')?.setValue(data?.id);
  }

  selectVariantGalleriesImages(data: IAttachment, index: number) {
    this.variationControl.at(index).get('variation_galleries_id')?.setValue(data?.id);
  }

  selectWatermarkImage(data: IAttachment) {
    this.form.controls['watermark_image_id'].setValue(data?.id);
  }

  selectMainFiles(data: IAttachment) {
    this.form.controls['digital_file_ids'].setValue(data?.id);
  }

  selectPreviewVideoFile(data: IAttachment) {
    this.form.controls['preview_video_file_id'].setValue(data?.id);
  }

  selectPreviewAudioFile(data: IAttachment) {
    this.form.controls['preview_audio_file_id'].setValue(data?.id);
  }

  selectVariationMainFiles(data: IAttachment, index: number) {
    this.variationControl.at(index).get('variation_digital_file_ids')?.setValue(data?.id);
  }

  onCoverImageChanged(index: number) {
    this.coverImageIndex = index;
    // Optionally update form control or trigger other actions
    console.log('Cover image changed to index:', index);
  }

  generateCombinations(
    attributes: IVariant[],
    index = 0,
    prefix = '',
    attribute_values: number[] = [],
  ): any {
    if (index === attributes.length) {
      let matchingVariation = this.variations.find(variation => {
        return variation.attribute_values.every(attrVal => attribute_values.includes(attrVal.id!));
      });
      return [{ ...matchingVariation, attribute_values }];
    }

    let results: any[] = [];
    let currentAttribute = attributes[index];
    let attributeValues = currentAttribute.attribute_values;

    if (attributeValues && attributeValues.length > 0) {
       attributeValues.forEach((value: any) => {
         let newPrefix = prefix ? `${prefix}-${value.value}` : value.value;
         let newAttributeValues = [...attribute_values, value.id!];
         results = results.concat(
           this.generateCombinations(attributes, index + 1, newPrefix, newAttributeValues),
         );
       });
     }

    return results;
  }

  isSubmitting = false;

  submit(redirect: boolean = true) {
    this.form.markAllAsTouched();

    if (this.form.controls['type'].value === 'simple') {
      this.form.controls['variations'].patchValue([]);
    }

    if (['simple', 'external'].includes(this.form.controls['type'].value)) {
      this.form.controls['attributes_ids'].setValue([]);
      this.clearVariations();
    }

    if (this.form.valid) {
      const formData = this.prepareFormData();
      const isEdit = this.type() === 'edit' && this.id;
      
      const apiCall = isEdit 
        ? this.productService.update(this.id, formData)
        : this.productService.create(formData);
      
      this.isSubmitting = true;
      this.form.disable();
      
      apiCall.subscribe({
        next: (response) => {
          this.notificationService.showSuccess(
            isEdit ? 'Ürün başarıyla güncellendi' : 'Ürün başarıyla oluşturuldu'
          );
          if (redirect) {
            this.router.navigateByUrl('/product');
          }
        },
        error: (error) => {
          console.error('Ürün kaydedilirken hata:', error);
          
          if (error.status === 422 && error.error?.errors) {
            this.handleValidationErrors(error.error.errors);
          } else {
            this.notificationService.showError(
              isEdit ? 'Ürün güncellenirken hata oluştu' : 'Ürün oluşturulurken hata oluştu'
            );
          }
        },
        complete: () => {
          this.isSubmitting = false;
          this.form.enable();
        }
      });
    }
  }

  prepareFormData() {
    const formValue = { ...this.form.value };
    
    ['price', 'tax_rate', 'stock_qty', 'min_qty', 'max_qty'].forEach(field => {
      if (formValue[field]) {
        formValue[field] = parseFloat(formValue[field].toString().replace(',', '.'));
      }
    });
    
    return formValue;
  }

  handleValidationErrors(errors: any) {
    Object.keys(errors).forEach(field => {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ serverError: errors[field][0] });
      }
    });
  }

  delete() {
    if (!this.id) {
      this.notificationService.showError('Ürün ID bulunamadı');
      return;
    }

    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      this.store.dispatch(new DeleteProductAction(this.id)).subscribe({
        next: () => {
          this.notificationService.showSuccess('Ürün başarıyla silindi');
          this.router.navigate(['/product']);
        },
        error: (error) => {
          console.error('Ürün silinirken hata:', error);
          this.notificationService.showError('Ürün silinirken hata oluştu');
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.form.reset();
    this.renderer.removeClass(this.document.body, 'loader-none');
  }
}
