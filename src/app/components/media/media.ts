import { Component, inject, viewChild } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { PageWrapper } from '../../shared/components/page-wrapper/page-wrapper';
import { MediaBox } from '../../shared/components/ui/media-box/media-box';
import { DeleteModal } from '../../shared/components/ui/modal/delete-modal/delete-modal';
import { MediaModal } from '../../shared/components/ui/modal/media-modal/media-modal';
import { HasPermissionDirective } from '../../shared/directive/has-permission.directive';
import { IAttachment } from '../../shared/interface/attachment.interface';
import { DeleteAllAttachmentAction } from '../../shared/store/action/attachment.action';

@Component({
  selector: 'app-media',
  imports: [
    TranslateModule,
    HasPermissionDirective,
    PageWrapper,
    MediaBox,
    MediaModal,
    DeleteModal,
  ],
  templateUrl: './media.html',
  styleUrl: './media.scss',
})
export class Media {
  private store = inject(Store);

  public images: IAttachment[] = [];

  readonly MediaModal = viewChild<MediaModal>('mediaModal');
  readonly DeleteModal = viewChild<DeleteModal>('deleteModal');

  selectImage(data: IAttachment[]) {
    this.images = data;
  }

  onActionClicked(action: string) {
    if (action == 'deleteAll') {
      let ids = this.images.map(image => image?.id!);
      this.store.dispatch(new DeleteAllAttachmentAction(ids)).subscribe({
        complete: () => {
          this.images = [];
        },
      });
    }
  }

  deleteImage(id: number) {
    this.images = this.images.filter(image => {
      return image.id !== id;
    });
  }
}
