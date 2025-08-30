import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PageWrapper } from '../../shared/components/page-wrapper/page-wrapper';
import { PriceTrPipe } from '../../shared/pipes/price-tr.pipe';
import { StockTrPipe } from '../../shared/pipes/stock-tr.pipe';

import { IProduct } from '../../shared/interface/product.interface';
import { GetProductsAction, DeleteProductAction, UpdateProductStatusAction } from '../../shared/store/action/product.action';
import { GetCategoriesAction } from '../../shared/store/action/category.action';
import { GetBrandsAction } from '../../shared/store/action/brand.action';
import { ProductState } from '../../shared/store/state/product.state';
import { CategoryState } from '../../shared/store/state/category.state';
import { BrandState } from '../../shared/store/state/brand.state';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService } from '../../shared/services/category.service';
import { BrandService } from '../../shared/services/brand.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-product',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    PageWrapper,
    PriceTrPipe,
    StockTrPipe,
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product {
  private store = inject(Store);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private notificationService = inject(NotificationService);
  private formBuilder = inject(FormBuilder);

  // Basic properties
  pageSize: number = 15;
  query: string = '';
  selectedCategory: any = null;
  selectedBrand: any = null;
  selectedStatus: string = '';
  products: IProduct[] = [];
  loading: boolean = false;

  // Pagination
  totalItems: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 15;

  // Search
  searchResults: IProduct[] = [];
  showSearchResults: boolean = false;
  searchTimeout: any;

  // Options
  categoryOptions: any[] = [];
  brandOptions: any[] = [];
  categories: any[] = [];
  brands: any[] = [];



  // Delete Modal
  showDeleteModal: boolean = false;
  productToDelete: IProduct | null = null;

  // Quick Edit modal properties
  showQuickEditModal: boolean = false;
  quickEditForm: FormGroup;
  quickEditLoading: boolean = false;
  productToEdit: IProduct | null = null;

 // Duplicate loading state
  duplicatingId: number | null = null;

  constructor() {
    this.quickEditForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock_qty: ['', [Validators.required, Validators.min(0)]],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.store.select(ProductState.product).subscribe((products) => {
      if (products) {
        this.products = products.data || [];
        this.totalItems = products.total || 0;
        this.loading = false;
      }
    });

    this.store.select(CategoryState.category).subscribe((categories) => {
      if (categories) {
        this.categories = categories.data || [];
      }
    });

    this.store.select(BrandState.brand).subscribe((brands) => {
      if (brands) {
        this.brands = brands.data || [];
      }
    });

    this.loadProducts();
  }

  loadCategories() {
    this.store.dispatch(new GetCategoriesAction());
  }

  loadBrands() {
    this.store.dispatch(new GetBrandsAction());
  }

  loadProducts() {
    this.loading = true;
    this.itemsPerPage = this.pageSize; // Sync itemsPerPage with pageSize
    const params: any = {
      page: this.currentPage,
      per_page: this.itemsPerPage
    };

    if (this.query) {
      params.search = this.query;
    }

    if (this.selectedCategory) {
      params.category_id = this.selectedCategory;
    }

    if (this.selectedBrand) {
      params.brand_id = this.selectedBrand;
    }

    if (this.selectedStatus !== '') {
      params.is_active = this.selectedStatus;
    }

    this.store.dispatch(new GetProductsAction(params)).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  reload() {
    this.loadProducts();
  }

  onCategory(event: any) {
    this.selectedCategory = event.value;
    this.loadProducts();
  }

  onBrand(event: any) {
    this.selectedBrand = event.value;
    this.loadProducts();
  }

  onCategoryChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onBrandChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onStatusChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages() && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  toggleStatus(product: IProduct) {
    const newStatus = !product.is_active;
    this.store.dispatch(new UpdateProductStatusAction(product.id, newStatus)).subscribe({
      next: () => {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index].is_active = newStatus;
        }
        this.notificationService.showSuccess(
          newStatus ? 'Ürün aktif edildi' : 'Ürün pasif edildi'
        );
      },
      error: (error) => {
        this.notificationService.showError('Durum güncellenemedi');
      }
    });
  }

  confirmDelete(product: IProduct) {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  deleteProduct() {
    if (!this.productToDelete) return;

    this.store.dispatch(new DeleteProductAction(this.productToDelete.id)).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== this.productToDelete!.id);
        this.notificationService.showSuccess('Ürün silindi');
        this.closeDeleteModal();
      },
      error: (error) => {
        this.notificationService.showError('Ürün silinemedi');
      }
    });
  }



  onSearchInput(event: any) {
    const searchTerm = event.target.value;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (searchTerm.length >= 2) {
      this.searchTimeout = setTimeout(() => {
        this.performSearch(searchTerm);
      }, 300);
    } else {
      this.hideSearchResults();
    }
  }

  performSearch(searchTerm: string) {
    this.productService.list({ search: searchTerm, per_page: 10 }).subscribe({
      next: (response) => {
        this.searchResults = response.data || [];
        this.showSearchResults = true;
      },
      error: () => {
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  selectSearchResult(product: IProduct) {
    this.query = product.name;
    this.hideSearchResults();
    this.loadProducts();
  }

  hideSearchResults() {
    setTimeout(() => {
      this.showSearchResults = false;
      this.searchResults = [];
    }, 200);
  }

  edit(product: IProduct) {
    this.router.navigate(['/product/edit', product.id]);
  }

  onActionClicked(event: any) {
    // Handle action clicks
  }

  export() {
    // Handle export
  }

  CSVModal() {
    return {
      openModal: () => {
        // Handle CSV modal
        console.log('CSV modal opened');
      }
    };
  }

  onTableChange(event: any) {
    if (event.page !== undefined) {
      this.currentPage = event.page + 1;
      this.loadProducts();
    }
  }

  formatPrice(value: number | string | null): string {
    if (value === null || value === undefined) return '0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0,00';
    return numValue.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatStock(qty: number | string | null, step?: number | string | null, unitText?: string | null): string {
    if (qty === null || qty === undefined) return '0';
    const numQty = typeof qty === 'string' ? parseFloat(qty) : qty;
    if (isNaN(numQty)) return '0';
    
    const numStep = step ? (typeof step === 'string' ? parseFloat(step) : step) : 1;
    const isInteger = numStep === 1;
    
    const formatted = isInteger ? 
      numQty.toString() : 
      numQty.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    
    return unitText ? `${formatted} ${unitText}` : formatted;
  }

  getUnitStep(unit: any): number | null {
    return typeof unit === 'object' && unit ? unit.step : null;
  }

  getUnitText(unit: any): string | null {
    return typeof unit === 'object' && unit ? unit.text : null;
  }

  trackByProductId(index: number, product: IProduct): number {
    return product.id;
  }

  onDuplicate(p: any) {
    if (!p?.id) return;
    this.duplicatingId = p.id;
    this.productService.duplicate(p.id).subscribe({
      next: (res) => {
        const created = res?.data ?? res;
        this.notificationService.showSuccess('Ürün kopyalandı');
        // Direkt edit sayfasına yönlendir:
        this.router.navigate(['/product/edit', created.id]);
        this.duplicatingId = null;
      },
      error: (e) => {
        console.error(e);
        this.notificationService.showError('Kopyalama başarısız');
        this.duplicatingId = null;
      }
    });
  }

  // Quick Edit Modal Methods
  openQuickEdit(product: IProduct) {
    this.productToEdit = product;
    this.quickEditForm.patchValue({
      name: product.name,
      price: product.price,
      stock_qty: product.stock_qty,
      is_active: product.is_active
    });
    this.showQuickEditModal = true;
  }

  closeQuickEditModal() {
    this.showQuickEditModal = false;
    this.productToEdit = null;
    this.quickEditForm.reset();
  }

  saveQuickEdit() {
    if (this.quickEditForm.valid && this.productToEdit) {
      this.quickEditLoading = true;
      const formData = this.quickEditForm.value;
      
      this.productService.update(this.productToEdit.id, formData).subscribe({
        next: (response) => {
          this.quickEditLoading = false;
          this.notificationService.showSuccess('Ürün başarıyla güncellendi.');
          this.closeQuickEditModal();
          this.loadProducts();
        },
        error: (error) => {
          this.quickEditLoading = false;
          console.error('Ürün güncellenirken hata:', error);
          this.notificationService.showError('Ürün güncellenirken bir hata oluştu.');
        }
      });
    }
  }
}
