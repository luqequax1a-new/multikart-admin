import { Component, inject, AfterViewInit, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { NotificationService } from '../../shared/services/notification.service';

import { Pagination } from '../../shared/components/ui/pagination/pagination';
import { Table } from '../../shared/components/ui/table/table';
import { NoData } from '../../shared/components/ui/no-data/no-data';
import { Loader } from '../../shared/components/loader/loader';

import { UnitsService } from './units.service';
import { IUnit } from './units.interface';

@Component({
  selector: 'app-units',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    Table,
    NoData,
    Loader,
    Pagination
  ],
  templateUrl: './units.html',
  styleUrl: './units.scss'
})
export class Units implements OnInit, AfterViewInit {
  private unitsService = inject(UnitsService);
  private notificationService = inject(NotificationService);
  private cd = inject(ChangeDetectorRef);
  private router = inject(Router);

  units: IUnit[] = [];
  pagedUnits: IUnit[] = [];
  loading = false;
  error: string | null = null;
  deleteModal = false;
  replaceModal = false;
  selectedUnit: IUnit | null = null;
  selectedReplaceUnitId: number | null = null;
  availableUnits: IUnit[] = [];
  loadingUnits = new Map<number, boolean>();



  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  get total(): number {
    return this.units.length;
  }

  ngOnInit() {
    this.loadUnits();
  }

  loadUnits() {
    this.loading = true;
    this.error = null;

    this.unitsService.list().subscribe({
      next: (response: IUnit[]) => {
        this.units = response || [];
        this.totalItems = this.units.length;
        this.buildPage();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Birimler yüklenirken hata oluştu:', error);
        this.error = 'Birimler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  onToggleStatus(unit: IUnit) {
    // Prevent multiple clicks
    if (this.loadingUnits.get(unit.id)) {
      return;
    }

    // Set loading state
    this.loadingUnits.set(unit.id, true);
    
    // Optimistic UI update
    const originalStatus = unit.is_active;
    unit.is_active = !unit.is_active;
    this.cd.detectChanges();

    // API call
    this.unitsService.updateStatus(unit.id, unit.is_active).subscribe({
      next: (updatedUnit) => {
        // Update the unit with server response
        const index = this.units.findIndex(u => u.id === unit.id);
        if (index !== -1) {
          this.units[index] = updatedUnit;
        }
        this.notificationService.showSuccess('Durum güncellendi');
        this.loadingUnits.set(unit.id, false);
        this.cd.detectChanges();
      },
      error: (error) => {
        // Revert optimistic update
        unit.is_active = originalStatus;
        this.notificationService.showError('Güncellenemedi');
        this.loadingUnits.set(unit.id, false);
        this.cd.detectChanges();
      }
    });
  }

  isUnitLoading(unitId: number): boolean {
    return this.loadingUnits.get(unitId) || false;
  }



  buildPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedUnits = this.units.slice(startIndex, endIndex);
  }

  formatStepDisplay(step: number): string {
    if (!step) return '0';
    // Eğer step tam sayı ise (5.0 gibi), ondalık kısmını gösterme
    if (step % 1 === 0) {
      return Math.floor(step).toString();
    }
    // Ondalık varsa, parseFloat ile gereksiz sıfırları kaldır
    return parseFloat(step.toString()).toString();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.buildPage();
  }

  onCreate() {
    this.router.navigate(['/units/create']);
  }

  openDeleteModal(unit: IUnit) {
    console.log('openDeleteModal çağrıldı, unit:', unit);
    this.selectedUnit = unit;
    this.deleteModal = true;
    
    // Bootstrap modal'ını programatik olarak aç
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      console.log('Bootstrap mevcut');
      const modalElement = document.getElementById('deleteModal');
      console.log('Modal element:', modalElement);
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        console.log('Modal instance oluşturuldu:', modal);
        modal.show();
        console.log('Modal.show() çağrıldı');
      } else {
        console.error('deleteModal elementi bulunamadı');
      }
    } else {
      console.error('Bootstrap yüklenmemiş');
    }
  }

  closeDeleteModal() {
    this.deleteModal = false;
    this.selectedUnit = null;
    
    // Bootstrap modal'ını programatik olarak kapat
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const modalElement = document.getElementById('deleteModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
    }
  }

  confirmDelete() {
    if (!this.selectedUnit) return;
    this.loading = true;

    this.unitsService.remove(this.selectedUnit.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `"${this.selectedUnit?.name}" birimi başarıyla silindi.`
        );
        this.closeDeleteModal();
        this.loadUnits();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.notificationService.showError(err.error?.message || 'Birim kullanımda; silinemez.');
          // Replace modalını aç
          this.openReplaceModal(this.selectedUnit);
        } else {
          this.notificationService.showError('Birim silinirken hata oluştu.');
        }
        this.closeDeleteModal();
      }
    });
  }

  openReplaceModal(unit: IUnit | null) {
    if (!unit) return;
    this.selectedUnit = unit;
    this.selectedReplaceUnitId = null;
    this.availableUnits = this.units.filter(u => u.id !== unit.id && u.is_active);
    this.replaceModal = true;
    
    // Bootstrap modal'ını programatik olarak aç
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const modalElement = document.getElementById('replaceModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  closeReplaceModal() {
    this.replaceModal = false;
    this.selectedUnit = null;
    this.selectedReplaceUnitId = null;
    this.availableUnits = [];
    
    // Bootstrap modal'ını programatik olarak kapat
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const modalElement = document.getElementById('replaceModal');
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
    }
  }

  confirmReplace() {
    if (!this.selectedUnit || !this.selectedReplaceUnitId) return;
    this.loading = true;

    this.unitsService.replace(this.selectedUnit.id, this.selectedReplaceUnitId).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `"${this.selectedUnit?.name}" birimi başarıyla değiştirildi.`
        );
        this.closeReplaceModal();
        this.loadUnits();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError('Birim değiştirme işlemi sırasında hata oluştu.');
        this.closeReplaceModal();
      }
    });
  }

  ngAfterViewInit() {
    // Bootstrap dropdown'larını initialize et
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      dropdownElementList.forEach(dropdownToggleEl => {
        new (window as any).bootstrap.Dropdown(dropdownToggleEl);
      });
    }
  }
}