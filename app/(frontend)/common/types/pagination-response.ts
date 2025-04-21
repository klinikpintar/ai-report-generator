export type PaginationResponse<T> = {
  message: string;
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
  };
};