export interface IUnit {
  id: number;
  name: string;
  text: string;
  step: number;
  is_active: boolean;
  products_count?: number; // yeni
  created_at?: string;
  updated_at?: string;
}

export interface IUnitsResponse {
  data: IUnit[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface ICreateUnit {
  name: string;
  text: string;
  step: number;
  is_active: boolean;
}

export interface IUpdateUnit extends ICreateUnit {
  id: number;
}