import { Injectable, inject } from '@angular/core';

import { Store, Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IAttachmentModel } from '../../interface/attachment.interface';
import { AttachmentService } from '../../services/attachment.service';
import { NotificationService } from '../../services/notification.service';
import {
  GetAttachmentsAction,
  CreateAttachmentAction,
  DeleteAttachmentAction,
  DeleteAllAttachmentAction,
} from '../action/attachment.action';

export class AttachmentStateModel {
  attachment: IAttachmentModel;
}

@State<AttachmentStateModel>({
  name: 'attachment',
  defaults: {
    attachment: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class AttachmentState {
  private store = inject(Store);
  private notificationService = inject(NotificationService);
  private attachmentService = inject(AttachmentService);

  @Selector()
  static attachment(state: AttachmentStateModel) {
    return state.attachment;
  }

  @Action(GetAttachmentsAction)
  getAttachments(ctx: StateContext<AttachmentStateModel>, action: GetAttachmentsAction) {
    return this.attachmentService.getAttachments(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            attachment: result,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(CreateAttachmentAction)
  create(_ctx: StateContext<AttachmentStateModel>, _action: CreateAttachmentAction) {
    // Create attachment logic here
  }

  @Action(DeleteAttachmentAction)
  delete(_ctx: StateContext<AttachmentStateModel>, { id: _id }: DeleteAttachmentAction) {
    // Delete attachment logic here
  }

  @Action(DeleteAllAttachmentAction)
  deleteAll(_ctx: StateContext<AttachmentStateModel>, { ids: _ids }: DeleteAllAttachmentAction) {
    // Delete all attachment logic here
  }
}
