import { CommonModule } from '@angular/common';
import { Component, viewChild, output, input, Input } from '@angular/core';

import { environment } from '../../../../../environments/environment.development';
import { IAttachment } from '../../../interface/attachment.interface';
import { MediaModal } from '../modal/media-modal/media-modal';

@Component({
  selector: 'app-image-upload',
  imports: [MediaModal, CommonModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUpload {
  readonly MediaModal = viewChild<MediaModal>('mediaModal');

  readonly id = input<string>(undefined);
  readonly url = input<boolean>(false);
  readonly multipleImage = input<boolean>(false);
  readonly helpText = input<string>(undefined);
  readonly accept = input<any>(undefined);

  @Input() images: IAttachment[] = [];
  @Input() image: IAttachment | null;
  @Input() imageUrl: string | null;

  readonly selectedFiles = output<any>();

  public showImages: IAttachment[] = [];
  public showImage: IAttachment | null;
  public showImageUrl: string | null;
  public selected: any;
  public videoType = ['mp4', 'webm', 'ogg'];
  public StorageURL = environment.storageURL;
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

  ngOnChanges() {
    this.showImage = this.image;
    this.showImages = this.images;
    this.showImageUrl = this.imageUrl;
  }

  selectImage(data: IAttachment, url: boolean) {
    if (Array.isArray(data)) {
      this.images = data;
      this.showImages = data;
    } else if (url) {
      this.imageUrl = data.original_url;
      this.showImageUrl = data.original_url;
    } else {
      this.image = data;
      this.showImage = data;
    }
    if (this.imageUrl) {
      this.selectedFiles.emit(data.asset_url);
    } else {
      const images = this.images;
      this.selectedFiles.emit(images.length ? images : this.image);
    }
  }

  remove(index: number, type: string) {
    const images = this.images;
    if (type == 'multiple' && Array.isArray(images)) {
      images.splice(index, 1);
      this.showImages = images;
    } else if (type == 'single_image_url') {
      this.imageUrl = null;
      this.showImageUrl = null;
      this.image = null;
    } else {
      this.image = null;
      this.showImage = null;
    }
    this.selectedFiles.emit(images.length ? images : this.image);
  }

  getMimeTypeImage(mimeType: string) {
    return this.mimeImageMapping.find(value => value.mimeType == mimeType)?.imagePath;
  }
}
