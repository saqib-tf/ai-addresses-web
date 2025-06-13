export interface PagedQuery {
  searchTerm?: string | null;
  sortBy?: string | null;
  sortDescending: boolean;
  pageNumber: number;
  pageSize: number;
}
