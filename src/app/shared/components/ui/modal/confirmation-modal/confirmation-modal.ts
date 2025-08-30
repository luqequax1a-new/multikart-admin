import { Component, TemplateRef, inject, viewChild, output } from '@angular/core';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ITableClickedAction } from '../../../../interface/table.interface';
import { Button } from '../../button/button';

@Component({
  selector: 'app-confirmation-modal',
  imports: [TranslateModule, Button],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
})
export class ConfirmationModal {
  private modalService = inject(NgbModal);

  public closeResult: string;
  public modalOpen: boolean = false;
  public userAction: ITableClickedAction;

  readonly ConfirmationModal = viewChild<TemplateRef<ITableClickedAction>>('confirmationModal');

  readonly confirmed = output<ITableClickedAction>();

  async openModal(action: string, data?: any, value?: any) {
    this.modalOpen = true;
    this.userAction = {
      actionToPerform: action,
      data: data,
      value: value,
    };
    this.modalService
      .open(this.ConfirmationModal(), {
        ariaLabelledBy: 'Confirmation-Modal',
        centered: true,
        windowClass: 'theme-modal text-center',
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

  confirm() {
    this.confirmed.emit(this.userAction);
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }
}
