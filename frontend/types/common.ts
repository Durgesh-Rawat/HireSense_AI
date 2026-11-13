export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export type SortDirection = "asc" | "desc";

export interface ApiErrorShape {
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string>;
}
