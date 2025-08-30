import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

// Breadcrumb component removed
import { FormUnitsComponent } from '../form-units/form-units';
import { UnitsService } from '../units.service';
import { ICreateUnit } from '../units.interface';

@Component({
  selector: 'app-create-units',
  imports: [
    CommonModule,
    TranslateModule,
    FormUnitsComponent,
  ], templateUrl: './create-units.html',
  styleUrl: './create-units.scss',
})
export class CreateUnits {
  private unitsService = inject(UnitsService);
  private router = inject(Router);

  loading = false;

  onSubmit(formData: ICreateUnit) {
    this.loading = true;
    
    this.unitsService.create(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.showToast('Birim başarıyla oluşturuldu.', 'success');
        setTimeout(() => {
          this.router.navigate(['/units']);
        }, 1000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Birim oluşturulurken hata:', error);
        this.showToast('Birim oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/units']);
  }

  private showToast(message: string, type: 'success' | 'error') {
    // Toast implementasyonu - mevcut toast servisinizi kullanın
    console.log(`Toast [${type}]: ${message}`);
  }
}