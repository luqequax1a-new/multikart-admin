import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, viewChild, input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Select2Data, Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { Observable, map } from 'rxjs';

import { Button } from '../../../../../shared/components/ui/button/button';
import { FormFields } from '../../../../../shared/components/ui/form-fields/form-fields';
import { countryCodes } from '../../../../../shared/data/country-code';
import { SelectUserAction } from '../../../../../shared/store/action/order.action';
import { CreateUserAddressAction } from '../../../../../shared/store/action/user.action';
import { CountryState } from '../../../../../shared/store/state/country.state';
import { StateState } from '../../../../../shared/store/state/state.state';

@Component({
  selector: 'app-add-address-modal',
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    Select2Module,
    Button,
    FormFields,
  ],
  templateUrl: './add-address-modal.html',
  styleUrl: './add-address-modal.scss',
})
export class AddAddressModal {
  private modalService = inject(NgbModal);
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);

  public form: FormGroup;
  public closeResult: string;
  public modalOpen: boolean = false;
  public states$: Observable<Select2Data>;

  public codes = countryCodes;

  readonly AddAddressModal = viewChild<TemplateRef<string>>('addAddressModal');
  countries$: Observable<Select2Data> = inject(Store).select(
    CountryState.countries,
  ) as Observable<Select2Data>;

  readonly id = input<number>(undefined);

  constructor() {
    this.form = this.formBuilder.group({
      user_id: new FormControl(''),
      title: new FormControl('', [Validators.required]),
      street: new FormControl('', [Validators.required]),
      type: new FormControl('shipping', [Validators.required]),
      state_id: new FormControl('', [Validators.required]),
      country_id: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [Validators.required]),
      country_code: new FormControl('1', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]*$/)]),
    });
  }

  countryChange(data: Select2UpdateEvent) {
    if (data && data?.value) {
      this.states$ = this.store
        .select(StateState.states)
        .pipe(map(filterFn => filterFn(+data?.value)));
      this.form.controls['state_id'].setValue('');
    }
  }

  async openModal(value?: string) {
    this.form.controls['type'].setValue(value);
    this.modalOpen = true;
    this.modalService
      .open(this.AddAddressModal(), {
        ariaLabelledBy: 'address-add-Modal',
        centered: true,
        windowClass: 'theme-modal modal-lg',
      })
      .result.then(
        result => {
          `Result ${result}`;
        },
        reason => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        },
      );
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  submit(id: number) {
    this.form.markAllAsTouched();
    this.form.controls['user_id'].setValue(id);
    if (this.form.valid) {
      this.store.dispatch(new CreateUserAddressAction(this.form.value)).subscribe({
        complete: () => {
          this.store.dispatch(new SelectUserAction(id));
        },
      });
    }
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }
}
