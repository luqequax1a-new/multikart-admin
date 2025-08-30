import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FormUnitsComponent } from '../form-units/form-units';
import { Loader } from '../../../shared/components/loader/loader';
import { UnitsService } from '../units.service';
import { ICreateUnit, IUnit } from '../units.interface';

@Component({
  selector: 'app-edit-units',
 imports: [
    CommonModule,
    TranslateModule,
    FormUnitsComponent,
    Loader,
  ],
  templateUrl: './edit-units.html',
  styleUrl: './edit-units.scss',
})
export class EditUnits implements OnInit, OnDestroy {
  private unitsService = inject(UnitsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  pageLoading = true;
  unitData: IUnit | null = null;
  unitId: number = 0;
  unitName: string = '';
  formDirty = false;
  private subscriptions = new Subscription();

  ngOnInit() {
    this.unitId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUnit();
  }

  loadUnit() {
    this.pageLoading = true;
    
    this.unitsService.getById(this.unitId).subscribe({
      next: (response) => {
        this.unitData = response;
        this.pageLoading = false;
      },
      error: (error) => {
        this.pageLoading = false;
        console.error('Birim bilgileri yüklenirken hata:', error);
        this.router.navigate(['/units']);
      }
    });
  }

  onSubmit(formData: ICreateUnit) {
    this.loading = true;
    
    this.unitsService.update(this.unitId, formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.formDirty = false;
        this.showToast('Birim başarıyla güncellendi.', 'success');
        setTimeout(() => {
          this.router.navigate(['/units']);
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Birim güncellenirken hata:', error);
        this.showToast('Birim güncellenirken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
      }
    });
  }

  onCancel() {
    if (this.formDirty) {
      if (confirm('Kaydedilmemiş değişiklikleriniz var. Yine de çıkmak istiyor musunuz?')) {
        this.formDirty = false;
        this.router.navigate(['/units']);
      }
    } else {
      this.router.navigate(['/units']);
    }
  }

  onFormChange(isDirty: boolean) {
    this.formDirty = isDirty;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.formDirty) {
      $event.returnValue = 'Kaydedilmemiş değişiklikleriniz var. Yine de çıkmak istiyor musunuz?';
    }
  }

  private showToast(message: string, type: 'success' | 'error') {
    // Toast implementasyonu - mevcut toast servisinizi kullanın
    console.log(`Toast [${type}]: ${message}`);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}