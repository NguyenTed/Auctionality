export interface Pagination {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default interface PagedResponse<T> {
  items: T[];
  pagination: Pagination;
}
