import { IAttachment } from './attachment.interface';
import { ICategory } from './category.interface';
import { IPaginateModel } from './core.interface';
import { ITag } from './tag.interface';

export interface IBlogModel extends IPaginateModel {
  data: IBlog[];
}

export interface IBlog {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  status: boolean;
  meta_title: string;
  meta_description: string;
  blog_thumbnail: IAttachment;
  blog_thumbnail_id: number;
  blog_meta_image_id: number;
  blog_meta_image: IAttachment;
  categories: ICategory[];
  tags: ITag[];
  is_featured: boolean;
  is_sticky: boolean;
  created_by_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
