export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  operationLoading: Record<string, boolean>;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
