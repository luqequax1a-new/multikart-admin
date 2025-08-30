import { Component, TemplateRef, inject, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { Button } from '../../../shared/components/ui/button/button';
import { IQuestionAnswers } from '../../../shared/interface/questions-answers.interface';
import { UpdateQuestionAnswersAction } from '../../../shared/store/action/questions-answers.action';

@Component({
  selector: 'app-answers-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, Button],
  templateUrl: './answers-modal.html',
  styleUrl: './answers-modal.scss',
})
export class AnswersModal {
  private modalService = inject(NgbModal);
  private store = inject(Store);

  public modalOpen: boolean = false;
  public closeResult: string;
  public qna: IQuestionAnswers;
  public answers = new FormControl('', [Validators.required]);

  readonly AnswersModal = viewChild<TemplateRef<string>>('answersModal');

  async openModal(data: IQuestionAnswers) {
    this.modalOpen = true;
    this.qna = data;
    if (data.answer) {
      this.answers.patchValue(data.answer);
    } else {
      this.answers.patchValue('');
    }
    this.modalService
      .open(this.AnswersModal(), {
        ariaLabelledBy: 'Payout-Modal',
        centered: true,
        windowClass: 'theme-modal text-center',
      })
      .result.then(
        result => {
          `Result ${result}`;
          this.closeResult = `Closed with: ${result}`;
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

  submit() {
    this.answers.markAllAsTouched();
    if (this.answers.valid) {
      let data = {
        question: this.qna.question,
        answer: this.answers.value,
        product_id: this.qna.product_id,
      };
      this.store.dispatch(new UpdateQuestionAnswersAction(data, this.qna.id)).subscribe({
        complete: () => {
          this.modalService.dismissAll();
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
