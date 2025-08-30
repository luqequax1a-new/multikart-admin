import {
  Component,
  SimpleChanges,
  TemplateRef,
  inject,
  viewChild,
  output,
  input,
} from '@angular/core';

import {
  ModalDismissReasons,
  NgbModal,
  NgbModalRef,
  NgbModule,
  NgbNav,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { NgxDropzoneChangeEvent, NgxDropzoneModule } from 'ngx-dropzone';

import * as media from '../../../../../shared/data/media-config';
import { HasPermissionDirective } from '../../../../directive/has-permission.directive';
import { IAttachment } from '../../../../interface/attachment.interface';
import { NotificationService } from '../../../../services/notification.service';
import { CreateAttachmentAction } from '../../../../store/action/attachment.action';
import { Button } from '../../button/button';
import { MediaBox } from '../../media-box/media-box';

@Component({
  selector: 'app-media-modal',
  imports: [
    TranslateModule,
    NgbModule,
    Button,
    NgxDropzoneModule,
    MediaBox,
    HasPermissionDirective,
  ],
  templateUrl: './media-modal.html',
  styleUrl: './media-modal.scss',
})
export class MediaModal {
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private modalService = inject(NgbModal);

  public active = 'select';
  public closeResult: string;
  public modalOpen: boolean = false;
  public media: IAttachment;
  public files: File[] = [];
  public selectedImages: number[] = [];

  readonly selectMedia = input<boolean>(true);
  readonly multipleImage = input<boolean>(false);
  readonly url = input<boolean>(false);
  readonly accept = input([
    media.mediaConfig.image,
    media.mediaConfig.video,
    media.mediaConfig.audio,
  ]);
  readonly selectedImagesIds = input<any>(undefined);

  readonly MediaModal = viewChild<TemplateRef<string>>('mediaModal');

  readonly selectImage = output<IAttachment>();

  ngOnChanges(change: SimpleChanges) {
    this.selectedImages = [];
    if (Array.isArray(change['selectedImagesIds']?.currentValue)) {
      this.selectedImages = change['selectedImagesIds']?.currentValue;
    } else if (change['selectedImagesIds']?.currentValue) {
      this.selectedImages.push(change['selectedImagesIds']?.currentValue);
    } else {
      this.selectedImages.push(change['selectedImagesIds']?.currentValue);
    }
  }

  async openModal() {
    this.modalOpen = true;
    if (this.selectMedia()) this.active = 'select';
    else this.active = 'upload';
    this.modalService
      .open(this.MediaModal(), {
        ariaLabelledBy: 'Media-Modal',
        centered: true,
        windowClass: 'theme-modal modal-xl media-modal',
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
    if (this.selectMedia()) this.active = 'select';
    else this.active = 'upload';
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onSelect(event: NgxDropzoneChangeEvent) {
    if (this.files.length + event.addedFiles.length <= 5) {
      this.files.push(...event.addedFiles);
    } else this.notificationService.showError(`You've reached 5 file maximum.`);
  }

  onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  addMedia(nav: NgbNav) {
    if (this.files.length) {
      if (this.active == 'upload') {
        this.store.dispatch(new CreateAttachmentAction(this.files)).subscribe({
          complete: () => {
            this.files = [];
            if (this.selectMedia()) {
              nav.select('select');
            } else {
              this.modalService.dismissAll();
            }
          },
        });
      }
    }
  }

  setImage(data: IAttachment) {
    this.media = data;
  }

  selectedMedia(modal: NgbModalRef) {
    this.selectImage.emit(this.media);
    modal.dismiss('close');
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }
}
