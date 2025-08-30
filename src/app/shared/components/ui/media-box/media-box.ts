import { CommonModule } from '@angular/common';
import {
  Component,
  DOCUMENT,
  inject,
  input,
  Input,
  output,
  Renderer2,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Params } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';

import { IAttachment, IAttachmentModel } from '../../../interface/attachment.interface';
import {
  DeleteAttachmentAction,
  GetAttachmentsAction,
} from '../../../store/action/attachment.action';
import { AttachmentState } from '../../../store/state/attachment.state';
import { Loader } from '../../loader/loader';
import { DeleteModal } from '../modal/delete-modal/delete-modal';
import { NoData } from '../no-data/no-data';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-media-box',
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    Loader,
    DeleteModal,
    Pagination,
    NoData,
  ],
  templateUrl: './media-box.html',
  styleUrl: './media-box.scss',
})
export class MediaBox {
  private store = inject(Store);
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);

  attachment$: Observable<IAttachmentModel> = inject(Store).select(AttachmentState.attachment);

  readonly DeleteModal = viewChild<DeleteModal>('deleteModal');

  readonly multiple = input<boolean>(false);
  readonly url = input<boolean>(false);
  readonly deleteAction = input<boolean>(true);
  readonly accept = input<any[]>(undefined);

  @Input() loading: boolean = true;
  @Input() selectedImages: any;

  readonly setImage = output<[] | any>();
  readonly setDeleteImage = output<[] | any>();

  public term = new FormControl();
  public filter = {
    search: '',
    field: '',
    mime_type: '',
    sort: '', // current Sorting Order
    page: 1, // current page number
    paginate: 50, // Display per page,
  };
  public totalItems: number = 0;
  public filteredMedia: IAttachment[];
  private mediaType: string[];
  public selected: any[];

  public mimeImageMapping: { mimeType: string; imagePath: string }[] = [
    { mimeType: 'application/pdf', imagePath: 'assets/images/pdf.png' },
    { mimeType: 'application/msword', imagePath: 'assets/images/word.png' },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      imagePath: 'assets/images/word.png',
    },
    { mimeType: 'application/vnd.ms-excel', imagePath: 'assets/images/xls.png' },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      imagePath: 'assets/images/xls.png',
    },
    { mimeType: 'application/vnd.ms-powerpoint', imagePath: 'assets/images/folder.png' },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      imagePath: 'assets/images/folder.png',
    },
    { mimeType: 'text/plain', imagePath: 'assets/images/txt.png' },
    { mimeType: 'audio/mpeg', imagePath: 'assets/images/sound.png' },
    { mimeType: 'audio/wav', imagePath: 'assets/images/sound.png' },
    { mimeType: 'audio/ogg', imagePath: 'assets/images/sound.png' },
    { mimeType: 'video/mp4', imagePath: 'assets/images/video.png' },
    { mimeType: 'video/webm', imagePath: 'assets/images/video.png' },
    { mimeType: 'video/ogg', imagePath: 'assets/images/video.png' },
    { mimeType: 'application/zip', imagePath: 'assets/images/zip.png' },
    { mimeType: 'application/x-tar', imagePath: 'assets/images/zip.png' },
    { mimeType: 'application/gzip', imagePath: 'assets/images/zip.png' },
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['accept']?.currentValue?.length) {
      this.mediaType = changes['accept']?.currentValue;
    }

    const selectedImages = this.selectedImages();
    if (selectedImages.length)
      this.selected = selectedImages?.map((res: any) => {
        return res?.id ? res?.id : res;
      });
  }

  ngOnInit() {
    this.getAttachments(this.filter, true);
    this.attachment$.subscribe(attachment => (this.totalItems = attachment?.total));
    this.term.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((data: string) => {
        this.filter.search = data;
        this.getAttachments(this.filter);
      });
  }

  getAttachments(filter: Params, loader?: boolean) {
    if (this.mediaType?.length) {
      this.filter['mime_type'] = this.mediaType.join();
    }
    this.loading = loader && this.deleteAction() ? false : true;
    this.store.dispatch(new GetAttachmentsAction(filter)).subscribe({
      complete: () => {
        this.loading = false;
      },
    });
    if (!loader) this.renderer.addClass(this.document.body, 'loader-none');
  }

  onMediaChange(event: Event) {
    this.filter.sort = (<HTMLInputElement>event.target).value;
    this.getAttachments(this.filter);
  }

  onActionClicked(action: string, data: IAttachment) {
    if (action == 'delete')
      this.store.dispatch(new DeleteAttachmentAction(data.id!)).subscribe({
        complete: () => {
          this.setDeleteImage.emit(data.id!);
        },
      });
  }

  selectImage(event: Event, attachment: IAttachment, url: boolean) {
    if (this.multiple()) {
      const index = this.selectedImages().indexOf(attachment);
      if ((<HTMLInputElement>event.target).checked) {
        if (index === -1) {
          this.selectedImages().push(attachment);
        }
      } else {
        this.selectedImages = this.selectedImages().filter(
          (image: any) => image.id !== parseInt((<HTMLInputElement>event.target).value),
        );
      }
    } else {
      this.selectedImages = attachment;
    }

    if (url) {
      this.selectedImages = <any>attachment;
    }
    this.setImage.emit(this.selectedImages());
  }

  setPaginate(data: number) {
    this.filter.page = data;
    this.getAttachments(this.filter);
  }

  getMimeTypeImage(mimeType: string) {
    return this.mimeImageMapping.find(value => value.mimeType == mimeType)?.imagePath;
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'loader-none');
  }
}
