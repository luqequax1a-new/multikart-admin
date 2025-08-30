import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { Button } from '../../../shared/components/ui/button/button';
import { ICreateUnit, IUnit } from '../units.interface';

@Component({
  selector: 'app-form-units',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    Button,
  ],
  templateUrl: './form-units.html',
  styleUrl: './form-units.scss',
})
export class FormUnitsComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() loading = false;
  @Input() initialData: IUnit | null = null;
  @Output() formSubmit = new EventEmitter<ICreateUnit>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formChange = new EventEmitter<boolean>();

  unitsForm!: FormGroup;
  lastSavedTime: Date | null = null;
  validationErrors: { [key: string]: string } = {};

  ngOnInit() {
    this.initForm();
    
    if (this.initialData) {
      this.populateForm();
    }
  }

  initForm() {
    this.unitsForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      text: ['', [Validators.required, Validators.maxLength(10)]],
      step: [1, [Validators.required, Validators.min(0.1), Validators.pattern(/^\d+(\.\d{1})?$/)]],
      is_active: [true]
    });
    
    // Form değişikliklerini dinle
    this.unitsForm.valueChanges.subscribe(() => {
      this.formChange.emit(this.unitsForm.dirty);
    });
  }

  populateForm() {
    if (this.initialData) {
      // Step değerini formatla - tam sayı ise ondalık gösterme
      const formattedStep = this.initialData.step % 1 === 0 ? 
        parseInt(this.initialData.step.toString()) : 
        this.initialData.step;
      
      this.unitsForm.patchValue({
        name: this.initialData.name,
        text: this.initialData.text,
        step: formattedStep,
        is_active: this.initialData.is_active
      });
    }
  }

  onSubmit() {
    if (this.unitsForm.valid) {
      const formData: ICreateUnit = {
        name: this.unitsForm.value.name.trim(),
        text: this.unitsForm.value.text.trim(),
        step: Number(this.unitsForm.value.step),
        is_active: this.unitsForm.value.is_active
      };
      
      this.formSubmit.emit(formData);
    } else {
      this.markFormGroupTouched();
      this.focusFirstInvalidField();
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  private markFormGroupTouched() {
    Object.keys(this.unitsForm.controls).forEach(key => {
      const control = this.unitsForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    // Backend validation errors have priority
    if (this.validationErrors[fieldName]) {
      return this.validationErrors[fieldName];
    }

    const field = this.unitsForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'name' ? 'Ad' : fieldName === 'text' ? 'Kısa Metin' : 'Step'} zorunludur.`;
      }
      if (field.errors['maxLength']) {
        return `${fieldName === 'name' ? 'Ad' : 'Kısa Metin'} en fazla ${field.errors['maxLength'].requiredLength} karakter olmalıdır.`;
      }
      if (field.errors['min']) {
        return 'Step değeri 0\'dan büyük olmalıdır.';
      }
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.unitsForm.get(fieldName);
    return !!(field?.invalid && field?.touched) || !!this.validationErrors[fieldName];
  }

  onStepInput(event: any) {
    const value = event.target.value;
    
    // Prevent negative values
    if (parseFloat(value) <= 0) {
      event.target.value = '0.1';
      this.unitsForm.patchValue({ step: 0.1 });
      return;
    }

    // Limit decimal places to 1
    const parts = value.split('.');
    if (parts[1] && parts[1].length > 1) {
      const truncated = parts[0] + '.' + parts[1].substring(0, 1);
      event.target.value = truncated;
      this.unitsForm.patchValue({ step: parseFloat(truncated) });
    }
  }

  formatStepValue(value: number): string {
    if (!value) return '';
    // Tam sayı ise ondalık kısmını gösterme
    if (value % 1 === 0) {
      return parseInt(value.toString()).toString();
    }
    return value.toString();
  }



  focusFirstInvalidField() {
    const firstInvalidField = Object.keys(this.unitsForm.controls)
      .find(key => this.unitsForm.get(key)?.invalid);
    
    if (firstInvalidField) {
      const element = document.getElementById(firstInvalidField);
      element?.focus();
    }
  }

  setValidationErrors(errors: { [key: string]: string }) {
    this.validationErrors = errors;
    // Mark fields as touched to show errors
    Object.keys(errors).forEach(key => {
      this.unitsForm.get(key)?.markAsTouched();
    });
  }

  clearValidationErrors() {
    this.validationErrors = {};
  }
}