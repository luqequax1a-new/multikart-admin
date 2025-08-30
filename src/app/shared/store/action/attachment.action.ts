import { Params } from '../../interface/core.interface';

export class GetAttachmentsAction {
  static readonly type = '[Attachment] Get';
  constructor(public payload?: Params) {}
}

export class CreateAttachmentAction {
  static readonly type = '[Attachment] Create';
  constructor(public payload: File[]) {}
}

export class DeleteAttachmentAction {
  static readonly type = '[Attachment] Delete';
  constructor(public id: number) {}
}

export class DeleteAllAttachmentAction {
  static readonly type = '[Attachment] Delete All';
  constructor(public ids: number[]) {}
}
